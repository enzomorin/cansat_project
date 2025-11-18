# Exemple de serveur HTTP basique
import http.server
import socketserver

PORT = 8080 # Port d'écoute du serveur
Handler = http.server.SimpleHTTPRequestHandler

class MyHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/":
            self.send_response(301)
            self.send_header("Location", "/index.html")
            self.end_headers()
        else:
            super().do_GET()

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serveur en cours d'exécution sur le port {PORT}")
    httpd.serve_forever()