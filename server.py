import http.server
import socketserver
import os
import sys

PORT = 3000

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

def run_server():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    for p in range(PORT, PORT + 20):
        try:
            with socketserver.TCPServer(("", p), Handler) as httpd:
                print(f"Server started at http://localhost:{p}")
                print(f"Open http://localhost:{p}/index.html to view the chatbot showcase.")
                print(f"Open http://localhost:{p}/embed-demo.html to view the embed widget.")
                sys.stdout.flush()
                httpd.serve_forever()
        except OSError:
            continue

if __name__ == "__main__":
    run_server()
