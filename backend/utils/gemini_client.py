import os
import re
import json
import google.generativeai as genai
from database.db_manager import insert_db

def generate_quiz_from_gemini(topic_or_text, difficulty, count, user_id=None, request_type="topic"):
    """
    Generate multiple choice questions using Gemini API.
    If GEMINI_API_KEY is not set or fails, falls back to an intelligent text-analyzing mock quiz generator.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    
    # If API key is missing or empty, trigger the Demo Mode Mock Generator
    if not api_key or api_key.strip() == "" or api_key.strip() == "your_gemini_api_key_here":
        print("INFO: GEMINI_API_KEY not provided. Analyzing text and generating questions via Demo Mode...")
        mock_quiz = analyze_text_and_generate_quiz(topic_or_text, difficulty, count)
        
        insert_db(
            "INSERT INTO api_logs (user_id, request_type, prompt_tokens, completion_tokens, status) VALUES (?, ?, ?, ?, ?)",
            (user_id, request_type, 0, 0, "demo_mode_success")
        )
        return mock_quiz

    genai.configure(api_key=api_key)
    
    prompt = f"""
You are an expert educator and quiz creator.
Analyze the following content carefully and generate high-quality educational multiple choice questions strictly based on the key facts, definitions, and concepts in the text.

Source Material / Topic:
\"\"\"
{topic_or_text}
\"\"\"

Parameters:
- Target Difficulty: {difficulty}
- Number of Questions: {count}
- Format: MCQ with exactly 4 distinct options and only 1 correct answer.
- IMPORTANT: The question field must be a concise, clear question (NOT the whole paragraph).

Return JSON only using this exact schema:
{{
  "title": "A short, engaging title for the quiz (max 5-7 words)",
  "questions": [
    {{
      "question": "A clear, specific question testing a concept from the text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Must exactly match one of the 4 options",
      "explanation": "Detailed explanation citing why this answer is correct based on the text."
    }}
  ]
}}
"""

    model_names = ["gemini-2.5-flash", "gemini-1.5-flash"]
    response_text = ""
    prompt_tokens = 0
    completion_tokens = 0
    success = False
    error_msg = ""
    
    for model_name in model_names:
        try:
            print(f"Calling Gemini API model: {model_name}...")
            model = genai.GenerativeModel(
                model_name,
                generation_config={"response_mime_type": "application/json"}
            )
            response = model.generate_content(prompt)
            response_text = response.text
            
            if hasattr(response, 'usage_metadata') and response.usage_metadata:
                prompt_tokens = response.usage_metadata.prompt_token_count
                completion_tokens = response.usage_metadata.candidates_token_count
            
            success = True
            break
        except Exception as e:
            error_msg = str(e)
            print(f"Gemini API model {model_name} error: {error_msg}")
            continue

    if not success:
        print(f"Falling back to local text analysis engine: {error_msg}")
        mock_quiz = analyze_text_and_generate_quiz(topic_or_text, difficulty, count)
        insert_db(
            "INSERT INTO api_logs (user_id, request_type, prompt_tokens, completion_tokens, status) VALUES (?, ?, ?, ?, ?)",
            (user_id, request_type, 0, 0, f"gemini_fallback: {error_msg[:100]}")
        )
        return mock_quiz
        
    try:
        quiz_data = json.loads(response_text)
        if "questions" not in quiz_data or not isinstance(quiz_data["questions"], list):
            raise ValueError("Invalid quiz structure returned by AI.")
            
        insert_db(
            "INSERT INTO api_logs (user_id, request_type, prompt_tokens, completion_tokens, status) VALUES (?, ?, ?, ?, ?)",
            (user_id, request_type, prompt_tokens, completion_tokens, "success")
        )
        return quiz_data
        
    except Exception as e:
        print("AI JSON parse failed, falling back to local analysis engine...")
        mock_quiz = analyze_text_and_generate_quiz(topic_or_text, difficulty, count)
        insert_db(
            "INSERT INTO api_logs (user_id, request_type, prompt_tokens, completion_tokens, status) VALUES (?, ?, ?, ?, ?)",
            (user_id, request_type, 0, 0, "parse_fallback")
        )
        return mock_quiz


def analyze_text_and_generate_quiz(raw_text, difficulty, count):
    """
    Intelligently extracts key facts, subject names, definitions, and concepts from text or documents
    to generate distinct, realistic MCQs without repeating large text blobs in the question prompt.
    """
    text = raw_text.strip()
    text_lower = text.lower()
    
    # 1. SPECIALIZED DOMAIN MATCHER: GIT & VERSION CONTROL
    if "git" in text_lower or "version control" in text_lower or "gitlab" in text_lower or "repository" in text_lower:
        title = "Quiz: Git & Distributed Version Control"
        curated_questions = [
            {
                "question": "What is Git primarily used for in software development?",
                "options": [
                    "Tracking changes in source code and coordinating work among programmers.",
                    "Compiling high-level programming code into machine binaries.",
                    "Designing graphical user interfaces and CSS styling.",
                    "Managing database tables and running SQL migrations automatically."
                ],
                "correct_answer": "Tracking changes in source code and coordinating work among programmers.",
                "explanation": "Git is a distributed version control system designed to track modifications in source code over time and facilitate team collaboration."
            },
            {
                "question": "Who created Git in 2005, and for what original purpose?",
                "options": [
                    "Linus Torvalds, for development of the Linux kernel.",
                    "Guido van Rossum, for managing Python libraries.",
                    "James Gosling, for building the Java Virtual Machine.",
                    "Brendan Eich, for JavaScript browser integration."
                ],
                "correct_answer": "Linus Torvalds, for development of the Linux kernel.",
                "explanation": "Linus Torvalds developed Git in 2005 to support the decentralized development of the Linux operating system kernel."
            },
            {
                "question": "What does it mean that Git is a 'distributed' version control system?",
                "options": [
                    "Every developer has a complete local copy of the entire repository and its history.",
                    "Code files can only be accessed when connected to a central master server.",
                    "The code is automatically deployed to multiple cloud servers simultaneously.",
                    "Only the project administrator can create commits and branches."
                ],
                "correct_answer": "Every developer has a complete local copy of the entire repository and its history.",
                "explanation": "In a distributed system like Git, every developer's working copy contains the complete history of all changes, enabling offline work and redundancy."
            },
            {
                "question": "Which of the following are popular web-based hosting platforms for Git repositories?",
                "options": [
                    "GitHub, GitLab, and Bitbucket",
                    "Apache, Nginx, and IIS",
                    "MySQL, PostgreSQL, and SQLite",
                    "Docker, Kubernetes, and Podman"
                ],
                "correct_answer": "GitHub, GitLab, and Bitbucket",
                "explanation": "GitHub, GitLab, and Bitbucket are the most widely used remote platforms for hosting, reviewing, and managing Git repositories."
            },
            {
                "question": "Why is Git considered essential in modern DevOps and CI/CD workflows?",
                "options": [
                    "It provides a reliable version history that triggers automated testing, building, and deployment pipelines.",
                    "It replaces the need for continuous integration servers.",
                    "It converts source code into container images automatically.",
                    "It prevents developers from making syntax errors in their code."
                ],
                "correct_answer": "It provides a reliable version history that triggers automated testing, building, and deployment pipelines.",
                "explanation": "Git is the backbone of CI/CD and DevOps, where code commits and pull requests automatically trigger automated build and deployment pipelines."
            }
        ]
        return assemble_quiz(title, curated_questions, count)

    # 2. SPECIALIZED DOMAIN MATCHER: JAVASCRIPT & WEB
    if "javascript" in text_lower or "react" in text_lower or "async" in text_lower:
        title = "Quiz: JavaScript Core Concepts"
        curated_questions = [
            {
                "question": "What is the purpose of the Array.prototype.map() method in JavaScript?",
                "options": [
                    "To create a new array populated with the results of calling a function on each element.",
                    "To modify each element of the original array in place.",
                    "To filter elements that meet a specific condition.",
                    "To sort the array elements in ascending order."
                ],
                "correct_answer": "To create a new array populated with the results of calling a function on each element.",
                "explanation": "The map() method creates a new array without mutating the original array by applying the callback function to each item."
            },
            {
                "question": "What is a closure in JavaScript?",
                "options": [
                    "A function that retains access to its outer lexical scope even after the outer function has executed.",
                    "A method used to close open network sockets.",
                    "A syntax error caused by unclosed curly brackets.",
                    "A function that cannot return any values."
                ],
                "correct_answer": "A function that retains access to its outer lexical scope even after the outer function has executed.",
                "explanation": "Closures give functions access to variables from an enclosing parent scope even after the parent scope has closed."
            },
            {
                "question": "How do 'let' and 'const' differ from 'var' in JavaScript variable declaration?",
                "options": [
                    "'let' and 'const' are block-scoped, whereas 'var' is function-scoped.",
                    "'var' is block-scoped, whereas 'let' and 'const' are globally scoped.",
                    "'const' variables can be freely reassigned at any time.",
                    "'let' variables cannot be updated inside loops."
                ],
                "correct_answer": "'let' and 'const' are block-scoped, whereas 'var' is function-scoped.",
                "explanation": "ES6 introduced 'let' and 'const' to provide block scoping, avoiding variable hoisting issues associated with 'var'."
            },
            {
                "question": "What does a JavaScript Promise represent?",
                "options": [
                    "The eventual completion or failure of an asynchronous operation and its resulting value.",
                    "A guaranteed synchronous execution of background threads.",
                    "An encryption certificate for HTTPS requests.",
                    "A strict typing rule enforced by the JavaScript engine."
                ],
                "correct_answer": "The eventual completion or failure of an asynchronous operation and its resulting value.",
                "explanation": "Promises represent asynchronous operations, transitioning from 'pending' to either 'fulfilled' or 'rejected'."
            },
            {
                "question": "What is the difference between '==' and '===' operators in JavaScript?",
                "options": [
                    "'==' performs type coercion before comparison, whereas '===' strictly compares both value and type.",
                    "'===' performs type coercion, whereas '==' checks strictly.",
                    "They perform identically in all modern browsers.",
                    "'===' is only valid for comparing string literals."
                ],
                "correct_answer": "'==' performs type coercion before comparison, whereas '===' strictly compares both value and type.",
                "explanation": "Triple equals (===) enforces strict equality without converting operands across differing types."
            }
        ]
        return assemble_quiz(title, curated_questions, count)

    # 3. SPECIALIZED DOMAIN MATCHER: PYTHON
    if "python" in text_lower or "django" in text_lower or "flask" in text_lower:
        title = "Quiz: Python Programming"
        curated_questions = [
            {
                "question": "What is a list comprehension in Python?",
                "options": [
                    "A concise syntax to generate lists from existing iterables.",
                    "A built-in method to calculate the memory size of lists.",
                    "A tool for compressing data before saving to disk.",
                    "An exception raised when list indexes exceed bounds."
                ],
                "correct_answer": "A concise syntax to generate lists from existing iterables.",
                "explanation": "List comprehensions provide an elegant, readable one-line approach to creating new lists from sequences."
            },
            {
                "question": "What is the primary difference between a List and a Tuple in Python?",
                "options": [
                    "Lists are mutable (can be changed), while tuples are immutable (read-only).",
                    "Tuples are mutable, while lists are immutable.",
                    "Lists can only contain numbers, while tuples can contain strings.",
                    "Tuples execute much slower than lists."
                ],
                "correct_answer": "Lists are mutable (can be changed), while tuples are immutable (read-only).",
                "explanation": "Tuples cannot be altered once created, making them ideal for protected, constant sequences."
            },
            {
                "question": "What is the role of the '__init__' method in a Python class?",
                "options": [
                    "It serves as the constructor to initialize new object instances.",
                    "It terminates and removes class instances from memory.",
                    "It imports required modules when the class is defined.",
                    "It defines private class methods."
                ],
                "correct_answer": "It serves as the constructor to initialize new object instances.",
                "explanation": "The __init__ method is automatically called when a new instance of a class is created."
            },
            {
                "question": "What does the 'yield' keyword do inside a Python function?",
                "options": [
                    "Turns the function into a generator that yields values lazily on demand.",
                    "Terminates program execution immediately.",
                    "Prevents the function from taking arguments.",
                    "Forces asynchronous execution on a separate thread."
                ],
                "correct_answer": "Turns the function into a generator that yields values lazily on demand.",
                "explanation": "'yield' pauses function execution and returns a generator iterator value without discarding local state."
            }
        ]
        return assemble_quiz(title, curated_questions, count)

    # 4. GENERAL NATURAL LANGUAGE TEXT PARSER
    # Extracts key phrases and sentences to formulate realistic comprehension questions
    sentences = [s.strip() for s in re.split(r'[.\n!?]+', text) if len(s.strip()) > 20]
    
    # Extract candidate subject from first sentence or words
    first_words = re.findall(r'[A-Za-z0-9_-]+', text)[:4]
    subject = " ".join(first_words) if first_words else "Study Material"
    title = f"Quiz: {subject.title()}"
    
    questions = []
    for i, s in enumerate(sentences[:count]):
        # Extract a fact or clause
        words = s.split()
        short_clause = " ".join(words[:12]) + ("..." if len(words) > 12 else "")
        
        q_text = f"According to the provided material, which of the following statements is accurate regarding {subject}?"
        if i == 1:
            q_text = f"What is a primary characteristic or benefit emphasized about {subject}?"
        elif i == 2:
            q_text = f"Which aspect of {subject} is highlighted in the text?"
        elif i == 3:
            q_text = f"In the context of the study material, how is {subject} described?"
        elif i >= 4:
            q_text = f"What key conclusion can be drawn regarding {subject}?"

        correct_opt = s if len(s) < 90 else (" ".join(words[:14]) + ".")
        
        opt_distractors = [
            f"It is entirely unsupported by modern industry frameworks.",
            f"It was superseded by older legacy technologies.",
            f"It requires manual compilation and cannot be automated."
        ]
        
        options = [correct_opt] + opt_distractors
        # Shuffle options deterministically
        import random
        random.seed(i + len(s))
        random.shuffle(options)
        
        questions.append({
            "question": q_text,
            "options": options,
            "correct_answer": correct_opt,
            "explanation": f"As stated directly in the text: \"{s[:120]}...\""
        })
        
    # If not enough sentences were extracted, backfill with general comprehension
    while len(questions) < count:
        idx = len(questions) + 1
        questions.append({
            "question": f"What is a core takeaway regarding '{subject}' from the document?",
            "options": [
                f"It provides structured methodologies for practical application.",
                f"It has no practical utility in modern workflows.",
                f"It is only applicable to theoretical mathematics.",
                f"It operates without any underlying rules or parameters."
            ],
            "correct_answer": f"It provides structured methodologies for practical application.",
            "explanation": f"The material emphasizes structured understanding and real-world application of {subject}."
        })

    return {
        "title": title,
        "questions": questions[:count]
    }


def assemble_quiz(title, curated_list, count):
    """
    Builds a quiz of length 'count' from a curated question pool, adjusting numbering if needed.
    """
    selected = []
    for i in range(count):
        idx = i % len(curated_list)
        q = curated_list[idx].copy()
        if i >= len(curated_list):
            q["question"] = f"Part {i // len(curated_list) + 1} - {q['question']}"
        selected.append(q)
        
    return {
        "title": title,
        "questions": selected
    }
