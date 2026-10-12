import os
import sys
import time
import subprocess
import webbrowser
import signal

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")

# Locate Python in venv
venv_python = os.path.join(BACKEND_DIR, "venv", "Scripts", "python.exe")
if not os.path.exists(venv_python):
    venv_python = sys.executable

def main():
    print("=" * 60)
    print("           QuizGenius AI - Unified Single Runner           ")
    print("=" * 60)
    print(f"Project Directory: {ROOT_DIR}")
    print()

    # 1. Start Flask backend
    print("[1/2] Launching Flask Backend on http://localhost:5000 ...")
    backend_proc = subprocess.Popen(
        [venv_python, "app.py"],
        cwd=BACKEND_DIR,
        shell=False
    )

    # 2. Start Vite frontend
    print("[2/2] Launching Vite Frontend on http://localhost:5173 ...")
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    frontend_proc = subprocess.Popen(
        [npm_cmd, "run", "dev"],
        cwd=FRONTEND_DIR,
        shell=True if os.name == "nt" else False
    )

    print()
    print("=" * 60)
    print(" QuizGenius AI is now RUNNING!")
    print(" - Backend API:  http://localhost:5000")
    print(" - Frontend App: http://localhost:5173")
    print(" Press Ctrl+C at any time to shut down both servers.")
    print("=" * 60)
    print()

    # Open browser automatically after short delay
    time.sleep(2.5)
    print("Opening QuizGenius AI in default browser...")
    webbrowser.open("http://localhost:5173")

    def cleanup(signum=None, frame=None):
        print("\nStopping QuizGenius AI servers...")
        try:
            if os.name == "nt":
                subprocess.call(["taskkill", "/F", "/T", "/PID", str(backend_proc.pid)], stderr=subprocess.DEVNULL)
                subprocess.call(["taskkill", "/F", "/T", "/PID", str(frontend_proc.pid)], stderr=subprocess.DEVNULL)
            else:
                backend_proc.terminate()
                frontend_proc.terminate()
        except Exception:
            pass
        print("Servers stopped successfully. Goodbye!")
        sys.exit(0)

    signal.signal(signal.SIGINT, cleanup)
    if hasattr(signal, "SIGBREAK"):
        signal.signal(signal.SIGBREAK, cleanup)

    try:
        while True:
            # Check if either process crashed unexpectedly
            if backend_proc.poll() is not None:
                print(f"[!] Backend stopped with code {backend_proc.returncode}")
                cleanup()
            if frontend_proc.poll() is not None:
                print(f"[!] Frontend stopped with code {frontend_proc.returncode}")
                cleanup()
            time.sleep(1)
    except KeyboardInterrupt:
        cleanup()

if __name__ == "__main__":
    main()
