#!/usr/bin/env python3

"""
Embedded Server for Aurorae Haven Offline Package (Python version)

This is a lightweight static file server that automatically opens
the application in the default browser. It's designed to provide
a double-click experience for offline users who have Python installed.
"""

import http.server
import socketserver
import webbrowser
import os
import sys
from pathlib import Path
import mimetypes

# Configuration
PORT = 8765
HOST = '127.0.0.1'

# errno constants for address already in use
EADDRINUSE_MACOS = 48   # macOS
EADDRINUSE_LINUX = 98   # Linux

# Add additional MIME types
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('application/javascript', '.mjs')
mimetypes.add_type('application/manifest+json', '.webmanifest')

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Custom handler with better MIME types and security"""
    
    def end_headers(self):
        # Add security headers
        self.send_header('Cache-Control', 'public, max-age=0')
        super().end_headers()
    
    def log_message(self, format, *args):
        # Simplified logging
        pass

def main():
    # Change to script directory
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    print("=" * 60)
    print("🌌 Aurorae Haven - Offline Server (Python)")
    print("=" * 60)
    print()
    
    try:
        # Create server
        with socketserver.TCPServer((HOST, PORT), CustomHTTPRequestHandler) as httpd:
            url = f"http://{HOST}:{PORT}"
            
            print(f"✓ Server running at: {url}")
            print(f"✓ Opening in your default browser...")
            print(f"\nPress Ctrl+C to stop the server\n")
            
            # Open browser after short delay
            try:
                webbrowser.open(url)
            except Exception as e:
                print("Failed to open browser automatically.")
                print(f"Please open your browser and navigate to: {url}")
            
            # Serve forever
            httpd.serve_forever()
            
    except OSError as e:
        if e.errno in (EADDRINUSE_MACOS, EADDRINUSE_LINUX):
            print(f"\n❌ Port {PORT} is already in use.")
            print(f"Please close the other application or use a different port.\n")
            sys.exit(1)
        else:
            print(f"Server error: {e}")
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n\n👋 Shutting down server...")
        print("✓ Server stopped")
        sys.exit(0)

if __name__ == "__main__":
    main()
