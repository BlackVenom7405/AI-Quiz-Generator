import os
import tempfile
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

# Load env variables if .env exists
load_dotenv()

from database.db_manager import init_db, query_db, execute_db, insert_db
from utils.auth import generate_token, token_required, admin_required
from utils.file_parser import parse_pdf, parse_docx, allowed_file
from utils.gemini_client import generate_quiz_from_gemini

app = Flask(__name__)
# Enable CORS for all routes (important for React frontend integration)
CORS(app)

# Configurations
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5MB upload limit

# Initialize Database
try:
    init_db()
except Exception as e:
    print(f"Database initialization error: {e}")

# Helper to format quiz response for the client (hiding answers during test)
def clean_quiz_for_taking(quiz_id, topic, difficulty, questions):
    return {
        "quiz_id": quiz_id,
        "topic": topic,
        "difficulty": difficulty,
        "questions": [
            {
                "question_id": q["question_id"],
                "question": q["question"],
                "options": [q["option1"], q["option2"], q["option3"], q["option4"]]
            } for q in questions
        ]
    }

# ================= AUTHENTICATION ENDPOINTS =================

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()

    if not name or not email or not password:
        return jsonify({'message': 'All fields (name, email, password) are required.'}), 400

    if len(password) < 6:
        return jsonify({'message': 'Password must be at least 6 characters long.'}), 400

    # Check if email exists
    existing_user = query_db("SELECT id FROM users WHERE email = ?", (email,), one=True)
    if existing_user:
        return jsonify({'message': 'Email already registered.'}), 409

    hashed_pw = generate_password_hash(password)
    try:
        user_id = insert_db(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            (name, email, hashed_pw)
        )
        return jsonify({
            'message': 'Registration successful!',
            'user': {
                'id': user_id,
                'name': name,
                'email': email
            }
        }), 201
    except Exception as e:
        return jsonify({'message': f'Database error: {str(e)}'}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()

    if not email or not password:
        return jsonify({'message': 'Email and password are required.'}), 400

    user = query_db("SELECT * FROM users WHERE email = ?", (email,), one=True)
    if not user or not check_password_hash(user['password'], password):
        return jsonify({'message': 'Invalid email or password.'}), 401

    token = generate_token(user['id'], user['email'], user['is_admin'])
    
    return jsonify({
        'token': token,
        'user': {
            'id': user['id'],
            'name': user['name'],
            'email': user['email'],
            'is_admin': bool(user['is_admin'])
        }
    }), 200

@app.route('/logout', methods=['POST'])
def logout():
    # Since we are using JWT, logout is primarily handled on the client by destroying the token.
    # Here we just return success.
    return jsonify({'message': 'Logged out successfully.'}), 200


# ================= QUIZ GENERATION ENDPOINTS =================

def save_quiz_to_db(user_id, quiz_data, difficulty):
    """
    Saves generated quiz JSON structure to database.
    Returns the quiz_id and list of inserted questions.
    """
    topic = quiz_data.get("title", "Generated Quiz")
    # Insert Quiz record with 0 values first, which will be updated on submit
    quiz_id = insert_db(
        "INSERT INTO quizzes (user_id, topic, difficulty, score, accuracy, time_taken) VALUES (?, ?, ?, ?, ?, ?)",
        (user_id, topic, difficulty, 0, 0.0, 0)
    )
    
    questions = []
    for q in quiz_data.get("questions", []):
        options = q.get("options", ["", "", "", ""])
        # Pad options to ensure there are exactly 4
        while len(options) < 4:
            options.append("")
            
        q_id = insert_db(
            """INSERT INTO questions 
               (quiz_id, question, option1, option2, option3, option4, correct_answer, explanation) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (quiz_id, q.get("question"), options[0], options[1], options[2], options[3], q.get("correct_answer"), q.get("explanation"))
        )
        questions.append({
            "question_id": q_id,
            "question": q.get("question"),
            "option1": options[0],
            "option2": options[1],
            "option3": options[2],
            "option4": options[3]
        })
        
    return quiz_id, topic, questions

@app.route('/generate-topic', methods=['POST'])
@token_required
def generate_topic(current_user):
    data = request.get_json() or {}
    topic = data.get('topic', '').strip()
    difficulty = data.get('difficulty', 'Medium').strip()
    count = data.get('count', 5)

    if not topic:
        return jsonify({'message': 'Topic is required.'}), 400

    try:
        count = int(count)
        if count < 1 or count > 30:
            return jsonify({'message': 'Question count must be between 1 and 30.'}), 400
    except ValueError:
        return jsonify({'message': 'Question count must be a number.'}), 400

    try:
        quiz_data = generate_quiz_from_gemini(topic, difficulty, count, user_id=current_user['id'], request_type="topic")
        quiz_id, db_topic, questions = save_quiz_to_db(current_user['id'], quiz_data, difficulty)
        
        # Clean response so that correct answers/explanations aren't sent to client
        quiz_for_client = clean_quiz_for_taking(quiz_id, db_topic, difficulty, questions)
        return jsonify(quiz_for_client), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/generate-text', methods=['POST'])
@token_required
def generate_text(current_user):
    data = request.get_json() or {}
    text = data.get('text', '').strip()
    difficulty = data.get('difficulty', 'Medium').strip()
    count = data.get('count', 5)

    if not text:
        return jsonify({'message': 'Text prompt or raw materials are required.'}), 400
    if len(text) < 50:
        return jsonify({'message': 'Please provide at least 50 characters of source text.'}), 400

    try:
        count = int(count)
    except ValueError:
        return jsonify({'message': 'Question count must be a number.'}), 400

    try:
        # Prompt Gemini with the text
        quiz_data = generate_quiz_from_gemini(text, difficulty, count, user_id=current_user['id'], request_type="text")
        quiz_id, db_topic, questions = save_quiz_to_db(current_user['id'], quiz_data, difficulty)
        
        quiz_for_client = clean_quiz_for_taking(quiz_id, db_topic, difficulty, questions)
        return jsonify(quiz_for_client), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/upload-pdf', methods=['POST'])
@token_required
def upload_pdf(current_user):
    if 'file' not in request.files:
        return jsonify({'message': 'No file uploaded.'}), 400
        
    file = request.files['file']
    difficulty = request.form.get('difficulty', 'Medium').strip()
    count = request.form.get('count', 5)

    try:
        count = int(count)
    except ValueError:
        return jsonify({'message': 'Question count must be a number.'}), 400

    if file.filename == '':
        return jsonify({'message': 'No file selected.'}), 400

    if not allowed_file(file.filename, {'pdf'}):
        return jsonify({'message': 'Invalid file format. Please upload a PDF.'}), 400

    filename = secure_filename(file.filename)
    temp_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(temp_path)

    try:
        # Extract text
        extracted_text = parse_pdf(temp_path)
        # Generate Quiz
        quiz_data = generate_quiz_from_gemini(extracted_text, difficulty, count, user_id=current_user['id'], request_type="pdf")
        quiz_id, db_topic, questions = save_quiz_to_db(current_user['id'], quiz_data, difficulty)
        
        quiz_for_client = clean_quiz_for_taking(quiz_id, db_topic, difficulty, questions)
        return jsonify(quiz_for_client), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500
    finally:
        # Cleanup
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.route('/upload-docx', methods=['POST'])
@token_required
def upload_docx(current_user):
    if 'file' not in request.files:
        return jsonify({'message': 'No file uploaded.'}), 400
        
    file = request.files['file']
    difficulty = request.form.get('difficulty', 'Medium').strip()
    count = request.form.get('count', 5)

    try:
        count = int(count)
    except ValueError:
        return jsonify({'message': 'Question count must be a number.'}), 400

    if file.filename == '':
        return jsonify({'message': 'No file selected.'}), 400

    if not allowed_file(file.filename, {'docx'}):
        return jsonify({'message': 'Invalid file format. Please upload a DOCX file.'}), 400

    filename = secure_filename(file.filename)
    temp_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(temp_path)

    try:
        # Extract text
        extracted_text = parse_docx(temp_path)
        # Generate Quiz
        quiz_data = generate_quiz_from_gemini(extracted_text, difficulty, count, user_id=current_user['id'], request_type="docx")
        quiz_id, db_topic, questions = save_quiz_to_db(current_user['id'], quiz_data, difficulty)
        
        quiz_for_client = clean_quiz_for_taking(quiz_id, db_topic, difficulty, questions)
        return jsonify(quiz_for_client), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500
    finally:
        # Cleanup
        if os.path.exists(temp_path):
            os.remove(temp_path)


# ================= QUIZ PLAY & REVIEW ENDPOINTS =================

@app.route('/submit', methods=['POST'])
@token_required
def submit_quiz(current_user):
    data = request.get_json() or {}
    quiz_id = data.get('quiz_id')
    user_answers = data.get('answers', {})  # Map of { question_id: selected_option_text }
    time_taken = data.get('time_taken', 0)  # In seconds

    if not quiz_id:
        return jsonify({'message': 'Quiz ID is required.'}), 400

    # Verify quiz belongs to this user
    quiz = query_db("SELECT * FROM quizzes WHERE quiz_id = ? AND user_id = ?", (quiz_id, current_user['id']), one=True)
    if not quiz:
        return jsonify({'message': 'Quiz not found or unauthorized.'}), 404

    # Fetch all questions for this quiz
    questions = query_db("SELECT * FROM questions WHERE quiz_id = ?", (quiz_id,))
    if not questions:
        return jsonify({'message': 'No questions found for this quiz.'}), 404

    total_questions = len(questions)
    correct_count = 0

    for q in questions:
        q_id = str(q['question_id'])
        user_ans = user_answers.get(q_id, '').strip()
        correct_ans = q['correct_answer'].strip()
        
        # Save user answer
        execute_db("UPDATE questions SET user_answer = ? WHERE question_id = ?", (user_ans, q['question_id']))
        
        # Check answer (case-insensitive strip comparison)
        if user_ans.lower() == correct_ans.lower():
            correct_count += 1

    accuracy = round((correct_count / total_questions) * 100, 2) if total_questions > 0 else 0.0
    
    # Update Quiz record with final results
    execute_db(
        "UPDATE quizzes SET score = ?, accuracy = ?, time_taken = ? WHERE quiz_id = ?",
        (correct_count, accuracy, time_taken, quiz_id)
    )

    # Fetch updated questions (with user_answer saved)
    updated_questions = query_db("SELECT * FROM questions WHERE quiz_id = ?", (quiz_id,))

    return jsonify({
        'quiz_id': quiz_id,
        'topic': quiz['topic'],
        'difficulty': quiz['difficulty'],
        'total_questions': total_questions,
        'correct_answers': correct_count,
        'wrong_answers': total_questions - correct_count,
        'score': correct_count,
        'accuracy': accuracy,
        'time_taken': time_taken,
        'pass_status': 'Pass' if accuracy >= 60 else 'Fail',
        'questions': [
            {
                'question_id': q['question_id'],
                'question': q['question'],
                'options': [q['option1'], q['option2'], q['option3'], q['option4']],
                'correct_answer': q['correct_answer'],
                'user_answer': q['user_answer'],
                'explanation': q['explanation']
            } for q in updated_questions
        ]
    }), 200

@app.route('/history', methods=['GET'])
@token_required
def get_history(current_user):
    search = request.args.get('search', '').strip()
    difficulty = request.args.get('difficulty', '').strip()
    
    query = "SELECT * FROM quizzes WHERE user_id = ?"
    params = [current_user['id']]
    
    if search:
        query += " AND topic LIKE ?"
        params.append(f"%{search}%")
        
    if difficulty and difficulty != "All":
        query += " AND difficulty = ?"
        params.append(difficulty)
        
    query += " ORDER BY created_at DESC"
    
    quizzes = query_db(query, tuple(params))
    return jsonify(quizzes), 200

@app.route('/history/<int:quiz_id>', methods=['GET'])
@token_required
def get_quiz_details(current_user, quiz_id):
    """
    Get full quiz results (including answers and explanation) for review page.
    """
    quiz = query_db("SELECT * FROM quizzes WHERE quiz_id = ? AND user_id = ?", (quiz_id, current_user['id']), one=True)
    if not quiz:
        return jsonify({'message': 'Quiz not found.'}), 404
        
    questions = query_db("SELECT * FROM questions WHERE quiz_id = ?", (quiz_id,))
    total_q = len(questions)
    correct_c = sum(1 for q in questions if q['user_answer'] and q['user_answer'].lower() == q['correct_answer'].lower())

    return jsonify({
        'quiz_id': quiz['quiz_id'],
        'topic': quiz['topic'],
        'difficulty': quiz['difficulty'],
        'total_questions': total_q,
        'correct_answers': correct_c,
        'wrong_answers': total_q - correct_c,
        'score': quiz['score'],
        'accuracy': quiz['accuracy'],
        'time_taken': quiz['time_taken'],
        'created_at': quiz['created_at'],
        'pass_status': 'Pass' if quiz['accuracy'] >= 60 else 'Fail',
        'questions': [
            {
                'question_id': q['question_id'],
                'question': q['question'],
                'options': [q['option1'], q['option2'], q['option3'], q['option4']],
                'correct_answer': q['correct_answer'],
                'user_answer': q['user_answer'],
                'explanation': q['explanation']
            } for q in questions
        ]
    }), 200

@app.route('/history/<int:quiz_id>', methods=['DELETE'])
@token_required
def delete_history(current_user, quiz_id):
    # Verify owner
    quiz = query_db("SELECT * FROM quizzes WHERE quiz_id = ? AND user_id = ?", (quiz_id, current_user['id']), one=True)
    if not quiz:
        return jsonify({'message': 'Quiz not found or unauthorized.'}), 404
        
    execute_db("DELETE FROM quizzes WHERE quiz_id = ?", (quiz_id,))
    # SQLite schema has cascade delete enabled, but just in case, we clean up
    execute_db("DELETE FROM questions WHERE quiz_id = ?", (quiz_id,))
    return jsonify({'message': 'Quiz record deleted successfully.'}), 200


# ================= DASHBOARD & STATS ENDPOINTS =================

@app.route('/dashboard', methods=['GET'])
@token_required
def get_dashboard(current_user):
    user_id = current_user['id']
    
    # Aggregate Stats
    stats = query_db(
        """SELECT 
           COUNT(*) as total_quizzes,
           MAX(score) as highest_score,
           AVG(score) as avg_score,
           AVG(accuracy) as avg_accuracy
           FROM quizzes WHERE user_id = ?""",
        (user_id,), one=True
    )
    
    total_q = stats['total_quizzes'] or 0
    highest = stats['highest_score'] or 0
    avg_s = round(stats['avg_score'] or 0.0, 2)
    avg_acc = round(stats['avg_accuracy'] or 0.0, 2)
    
    # Recent Quizzes (limit 5)
    recent = query_db(
        "SELECT * FROM quizzes WHERE user_id = ? ORDER BY created_at DESC LIMIT 5",
        (user_id,)
    )
    
    # Weekly performance: count of quizzes completed per day for last 7 days
    # Format: {'date': '2026-08-01', 'count': 2, 'score': 75.0}
    import datetime
    weekly_perf = []
    today = datetime.date.today()
    for i in range(6, -1, -1):
        day = today - datetime.timedelta(days=i)
        day_str = day.strftime('%Y-%m-%d')
        # Query score & count
        day_stats = query_db(
            """SELECT COUNT(*) as cnt, AVG(accuracy) as avg_acc 
               FROM quizzes WHERE user_id = ? AND date(created_at) = ?""",
            (user_id, day_str), one=True
        )
        weekly_perf.append({
            'date': day.strftime('%a'),  # Mon, Tue, etc.
            'count': day_stats['cnt'] or 0,
            'accuracy': round(day_stats['avg_acc'] or 0.0, 1)
        })

    return jsonify({
        'name': current_user['name'],
        'email': current_user['email'],
        'stats': {
            'total_quizzes': total_q,
            'highest_score': highest,
            'avg_score': avg_s,
            'accuracy': avg_acc
        },
        'recent_quizzes': recent,
        'weekly_performance': weekly_perf
    }), 200

@app.route('/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    user_id = current_user['id']
    
    # User basic info
    user_info = query_db("SELECT name, email, created_at, is_admin FROM users WHERE id = ?", (user_id,), one=True)
    
    # Aggregate Stats
    stats = query_db(
        """SELECT 
           COUNT(*) as total_quizzes,
           MAX(score) as highest_score,
           AVG(accuracy) as avg_accuracy,
           SUM(time_taken) as total_time
           FROM quizzes WHERE user_id = ?""",
        (user_id,), one=True
    )
    
    total_quizzes = stats['total_quizzes'] or 0
    highest_score = stats['highest_score'] or 0
    avg_accuracy = round(stats['avg_accuracy'] or 0.0, 1)
    total_time = stats['total_time'] or 0 # in seconds

    # Generate achievements based on criteria
    achievements = []
    if total_quizzes >= 1:
        achievements.append({
            "title": "Quiz Rookie",
            "description": "Completed your first quiz attempt on QuizGenius AI.",
            "icon": "Trophy",
            "unlocked": True
        })
    else:
        achievements.append({
            "title": "Quiz Rookie",
            "description": "Complete your first quiz to unlock.",
            "icon": "Trophy",
            "unlocked": False
        })
        
    if total_quizzes >= 5:
        achievements.append({
            "title": "Gemini Master",
            "description": "Completed 5 or more AI-generated quizzes.",
            "icon": "Sparkles",
            "unlocked": True
        })
    else:
        achievements.append({
            "title": "Gemini Master",
            "description": "Complete 5 quizzes to unlock.",
            "icon": "Sparkles",
            "unlocked": False
        })
        
    # Check if they have a perfect score (100% accuracy)
    perfect_quiz = query_db("SELECT quiz_id FROM quizzes WHERE user_id = ? AND accuracy = 100.0 LIMIT 1", (user_id,), one=True)
    if perfect_quiz:
        achievements.append({
            "title": "Einstein Status",
            "description": "Scored a perfect 100% accuracy on a quiz.",
            "icon": "Brain",
            "unlocked": True
        })
    else:
        achievements.append({
            "title": "Einstein Status",
            "description": "Score 100% accuracy on any quiz to unlock.",
            "icon": "Brain",
            "unlocked": False
        })
        
    # Speed runner achievement: completed a quiz in under 60 seconds with pass status
    speedy_quiz = query_db("SELECT quiz_id FROM quizzes WHERE user_id = ? AND time_taken > 0 AND time_taken < 60 AND accuracy >= 60 LIMIT 1", (user_id,), one=True)
    if speedy_quiz:
        achievements.append({
            "title": "Speed Runner",
            "description": "Passed a quiz in under 60 seconds.",
            "icon": "Zap",
            "unlocked": True
        })
    else:
        achievements.append({
            "title": "Speed Runner",
            "description": "Pass any quiz in under 60 seconds to unlock.",
            "icon": "Zap",
            "unlocked": False
        })

    return jsonify({
        'name': user_info['name'],
        'email': user_info['email'],
        'joined_date': user_info['created_at'],
        'is_admin': bool(user_info['is_admin']),
        'stats': {
            'total_quizzes': total_quizzes,
            'highest_score': highest_score,
            'accuracy': avg_accuracy,
            'total_time_spent': total_time  # in seconds
        },
        'achievements': achievements
    }), 200


# ================= ADMIN DASHBOARD ENDPOINTS =================

@app.route('/admin/analytics', methods=['GET'])
@token_required
@admin_required
def get_admin_analytics(current_user):
    # Total Users count (excluding admin seed unless they want it counted, which is fine)
    total_users = query_db("SELECT COUNT(*) as cnt FROM users", one=True)['cnt']
    
    # Total Quizzes count
    total_quizzes = query_db("SELECT COUNT(*) as cnt FROM quizzes", one=True)['cnt']
    
    # Avg Score
    avg_accuracy = query_db("SELECT AVG(accuracy) as avg_acc FROM quizzes", one=True)['avg_acc'] or 0.0
    
    # API usage statistics
    total_calls = query_db("SELECT COUNT(*) as cnt FROM api_logs", one=True)['cnt']
    success_calls = query_db("SELECT COUNT(*) as cnt FROM api_logs WHERE status = 'success'", one=True)['cnt']
    error_calls = query_db("SELECT COUNT(*) as cnt FROM api_logs WHERE status LIKE 'error%'", one=True)['cnt']
    
    # Recent API logs
    recent_api_logs = query_db("SELECT * FROM api_logs ORDER BY created_at DESC LIMIT 20")
    
    return jsonify({
        'stats': {
            'total_users': total_users,
            'total_quizzes': total_quizzes,
            'avg_accuracy': round(avg_accuracy, 2),
            'api_calls': {
                'total': total_calls,
                'success': success_calls,
                'error': error_calls
            }
        },
        'api_logs': recent_api_logs
    }), 200

@app.route('/admin/users', methods=['GET'])
@token_required
@admin_required
def get_admin_users(current_user):
    users = query_db("SELECT id, name, email, is_admin, created_at FROM users ORDER BY created_at DESC")
    return jsonify(users), 200

@app.route('/admin/users/<int:user_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_admin_user(current_user, user_id):
    if user_id == current_user['id']:
        return jsonify({'message': 'You cannot delete your own admin account.'}), 400
        
    execute_db("DELETE FROM users WHERE id = ?", (user_id,))
    # Sub-records (quizzes, questions) cascade deleted automatically via SQLite schema cascade
    return jsonify({'message': 'User and all associated data deleted successfully.'}), 200

@app.route('/admin/quizzes', methods=['GET'])
@token_required
@admin_required
def get_admin_quizzes(current_user):
    # Retrieve all quizzes with user email
    quizzes = query_db(
        """SELECT q.*, u.email as user_email, u.name as user_name 
           FROM quizzes q 
           JOIN users u ON q.user_id = u.id 
           ORDER BY q.created_at DESC"""
    )
    return jsonify(quizzes), 200

@app.route('/admin/quizzes/<int:quiz_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_admin_quiz(current_user, quiz_id):
    execute_db("DELETE FROM quizzes WHERE quiz_id = ?", (quiz_id,))
    execute_db("DELETE FROM questions WHERE quiz_id = ?", (quiz_id,))
    return jsonify({'message': 'Quiz deleted successfully.'}), 200


# ================= MAIN RUN =================

if __name__ == '__main__':
    # Initialize port on 5000
    app.run(host='0.0.0.0', port=5000, debug=True)
