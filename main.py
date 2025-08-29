from flask import Flask, render_template, request
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import os

app = Flask(__name__)

def is_valid_url(url):
    """Проверяет, является ли URL валидным"""
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except ValueError:
        return False

def get_all_images_from_url(target_url, max_images=20):
    """Получает изображения с указанного URL с ограничением количества"""
    if not is_valid_url(target_url):
        return []
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        response = requests.get(target_url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        images = []
        
        for img in soup.find_all('img'):
            if len(images) >= max_images:
                break
                
            src = img.get('src', '')
            if not src:
                continue
                
            absolute_url = urljoin(target_url, src)
            
            if absolute_url.startswith(('http://', 'https://')):
                images.append(absolute_url)
        
        return images
    
    except Exception as e:
        print(f"Ошибка при парсинге {target_url}: {e}")
        return []

@app.route('/', methods=['GET', 'POST'])
def index():
    images = []
    if request.method == 'POST':
        url = request.form.get('url', '').strip()
        try:
            max_images = min(100, max(1, int(request.form.get('max_images', 20))))
        except ValueError:
            max_images = 20
            
        if url:
            images = get_all_images_from_url(url, max_images=max_images)
    
    return render_template('main.html', images=images)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
