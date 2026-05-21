import re

with open('portfolio.html', 'r', encoding='utf-8') as f:
    html = f.read()

# We need to insert GDPR Legal Framework as a new project card. Let's replace P2 (ROPA) which is lines 1836-1867.
# Or better, let's just create a new grid of cards.

def update_cards(match):
    # This matches the entire projects-grid
    grid = match.group(1)
    
    # We will replace all launch-btn text with Launch Simulation
    grid = re.sub(r'<button class="launch-btn"[^>]*>.*?</button>', r'<button class="launch-btn">Launch Simulation <span class="btn-arrow">→</span></button>', grid)
    
    return f'<div class="projects-grid" id="projectGrid">{grid}</div>'

html = re.sub(r'<div class="projects-grid" id="projectGrid">(.*?)</div>\s*</div>\s*</section>', update_cards, html, flags=re.DOTALL)

with open('portfolio.html', 'w', encoding='utf-8') as f:
    f.write(html)
