import re

with open('portfolio.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. We need to make sure every project card has `has-sim` and is clickable.
# Let's define the 6 simulations from the prompt.
simulations = {
    '01': ("simulations/data-mapping/index.html", "GDPR Data Mapping & Inventory", "Data Mapping Workshop"),
    '02': ("simulations/legal-framework/index.html", "GDPR Legal Framework Lab", "Lawful Basis & Article Identification"),
    '03': ("simulations/dpia/index.html", "DPIA Assessment Lab", "Privacy Impact Assessment"),
    '04': ("simulations/vendor-risk/index.html", "Vendor Risk Sandbox", "Third-Party Risk Assessment"),
    '07': ("simulations/dsar/index.html", "DSAR Workflow Lab", "Data Subject Rights Management"),
    '09': ("simulations/incident-response/index.html", "Incident Response Simulator", "Breach Management & ICO Notification")
}

# Wait, P2 currently is ROPA. Let's change P2 to GDPR Legal Framework.
html = re.sub(
    r'<div class="project-title">Records of Processing Activities \(ROPA\)</div>',
    '<div class="project-title">GDPR Legal Framework</div>',
    html
)
html = re.sub(
    r'<div class="project-desc">Build a fully compliant Art. 30 ROPA register from the data inventory, structured\s*for DPO review and ICO submission readiness.</div>',
    '<div class="project-desc">Interactive legal reasoning simulation covering lawful basis assessments, GDPR article identification, DPIA decision scenarios, enforcement simulations, and privacy counsel decision workflows.</div>',
    html
)
html = re.sub(
    r'<li>Controller ROPA Register</li>\s*<li>Processor ROPA Register</li>\s*<li>ROPA Maintenance Procedure</li>\s*<li>DPO Sign-off Template</li>',
    '<li>Lawful Basis Assessments</li><li>Special Category Data</li><li>DPIA Decision Scenarios</li><li>Enforcement & Fines</li><li>Data Subject Rights</li>',
    html
)

def update_card(match):
    full = match.group(0)
    num_match = re.search(r'<div class="project-number">(.*?)</div>', full)
    if not num_match: return full
    num = num_match.group(1).strip()
    
    # Check if this card should have a sim
    if num in simulations:
        url, title, subtitle = simulations[num]
        
        # Add has-sim class if missing
        if 'has-sim' not in full:
            full = full.replace('<div class="project-card"', '<div class="project-card has-sim"')
            # also update data-status to active
            full = re.sub(r'data-status="[^"]*"', 'data-status="active"', full)
            full = re.sub(r'<span class="project-status-badge[^>]*>.*?</span>', '<span class="project-status-badge status-active">Live Module</span>', full)
            full = re.sub(r'<div class="project-progress-fill[^>]*style="width:0%">', '<div class="project-progress-fill fill-active" style="width:100%">', full)
            full = re.sub(r'<div class="project-progress-pct">0%</div>', '<div class="project-progress-pct">100%</div>', full)
        
        # Make the card clickable
        full = re.sub(r'<div class="project-card([^>]*)>', f'<div class="project-card\\1" onclick="launchSim(\'{url}\', \'{title}\', \'{subtitle}\')">', full)
        
        # Ensure it has a launch button
        if 'launch-btn' not in full:
            footer = f'''
            <div class="launch-module-wrap">
              <div class="sim-live-dot">Live · Interactive</div>
              <button class="launch-btn">Launch Simulation <span class="btn-arrow">→</span></button>
            </div>'''
            full = re.sub(r'<span class="project-link".*?</span>', footer, full, flags=re.DOTALL)
    
    # Change any existing launch button text
    full = re.sub(r'<button class="launch-btn"[^>]*>.*?</button>', '<button class="launch-btn">Launch Simulation <span class="btn-arrow">→</span></button>', full)
    
    # Add Operational Focus after Project Category
    cat_match = re.search(r'<div class="project-category">(.*?)</div>', full)
    if cat_match and "OPERATIONAL FOCUS:" not in full:
        cat = cat_match.group(1).upper()
        focus_div = f'<div class="operational-focus" style="font-size: 10px; font-weight: 600; color: var(--gold); margin-bottom: 12px; letter-spacing: 0.1em;">OPERATIONAL FOCUS: {cat}</div>'
        full = full.replace(cat_match.group(0), cat_match.group(0) + '\n            ' + focus_div)
        
    return full

html = re.sub(r'<div class="project-card.*?</div>\s*</div>\s*</div>', update_card, html, flags=re.DOTALL)

with open('portfolio.html', 'w', encoding='utf-8') as f:
    f.write(html)
