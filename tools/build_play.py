"""Build naschool.app/play from the CEO's prototype.

Fixes applied for a public early-access release:
- inline script moved to /play/game.js (the site's CSP blocks inline scripts)
- Google Fonts replaced with self-hosted fonts (/play/fonts.css)
- no password field, nothing stored that looks like an account
- simulated classmates are clearly NPCs, never shown as real players
- real date used for the 18+ check, quick start no longer fills in a date of birth
- tester panel renamed to Settings, internal wording removed
"""
import pathlib
import re
import shutil
import sys

SRC = pathlib.Path(sys.argv[1])
OUT = pathlib.Path(sys.argv[2])
FONTSRC = pathlib.Path(sys.argv[3])

html = SRC.read_text(encoding="utf8")
start = html.index("<script>")
end = html.index("</script>", start)
js = html[start + len("<script>"):end]
page = html[:start] + '<script src="/play/game.js"></script>' + html[end + len("</script>"):]


def swap(text, old, new, count=1, label=""):
    found = text.count(old)
    if found != count:
        raise SystemExit(f"[{label or old[:40]}] expected {count} match(es), found {found}")
    return text.replace(old, new)


# ---------- page ----------
page = swap(page, "<title>Na School Prototype</title>",
            '<title>Na School! Early access</title>\n'
            '<meta name="description" content="Play the Na School! early access: a Nigerian secondary-school life sim. Single player, saved on your device.">\n'
            '<meta name="theme-color" content="#174b3b">\n'
            '<link rel="icon" href="/favicon.svg" type="image/svg+xml">', label="title")
page = swap(page, '<link rel="preconnect" href="https://fonts.googleapis.com">\n', "", label="preconnect1")
page = swap(page, '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n', "", label="preconnect2")
page = re.sub(r'<link rel="stylesheet" href="https://fonts\.googleapis\.com/css2[^"]*">',
              '<link rel="stylesheet" href="/play/fonts.css">', page)
if "fonts.googleapis" in page or "fonts.gstatic" in page:
    raise SystemExit("Google Fonts reference left in page")

# ---------- account step: no password, honest copy ----------
js = swap(js, '<h2>Create your account</h2><p class="sub">All players are 18 or older. Your school character is fictional.</p>',
          '<h2>Make your student</h2><p class="sub">Early access for players aged 18 and over. This is a single-player preview: your game is saved on this device only, and nothing is sent to us. Multiplayer is coming soon.</p>',
          label="account heading")
js = re.sub(r'\s*<div class="field"><label for="f-pass">Password</label><input id="f-pass"[^>]*></div>', "", js)
if "f-pass" in js.split("function fillDemo")[0]:
    raise SystemExit("password field still in the form")
js = swap(js, "I accept the Terms of Use and Privacy Policy.</label>",
          'I’m 18 or over and I’ve read the <a href="/privacy.html" target="_blank" rel="noopener">privacy notice</a>.</label>',
          label="terms label")
js = swap(js, '>Fill demo details</button>', '>Quick start</button>', label="demo button")
js = swap(js, '>Create account</button>', '>Continue</button>', label="create button")
js = swap(js, "function fillDemo(){$('#f-user').value='tobi_lagos';$('#f-pass').value='naschool';$('#f-name').value='Tolu';$('#f-nick').value='Professor';$('#f-dob').value='2001-03-14';$('#f-terms').checked=true}",
          "function fillDemo(){$('#f-user').value='student'+Math.floor(1000+Math.random()*9000);$('#f-name').value='Tolu';$('#f-nick').value='Professor';$('#f-dob').focus()}",
          label="fillDemo")
js = swap(js, "p=$('#f-pass').value,", "", label="read pass")
js = swap(js, "else if(p.length<6)err='Password needs at least 6 characters.';", "", label="pass rule")
js = swap(js, "username:u,pass:p,", "username:u,", label="store pass")
js = swap(js, "Nigerian school life simulator · prototype", "Nigerian school life simulator · early access", label="brand note")
js = swap(js, '> I\u2019m 18 or over and I\u2019ve read the <a href="/privacy.html" target="_blank" rel="noopener">privacy notice</a>.</label>',
          '> <span>I\u2019m 18 or over and I\u2019ve read the <a href="/privacy.html" target="_blank" rel="noopener">privacy notice</a>.</span></label>', label="terms span")
js = swap(js, "now=new Date('2026-10-06')", "now=new Date()", label="age date")
js = swap(js, "err='Accept the Terms of Use and Privacy Policy to continue.'",
          "err='Tick the box to confirm you’re 18 or over.'", label="terms error")

# ---------- simulated classmates are NPCs, never "players" ----------
js = swap(js, "const sims=[['kachi','Kachi_99','M',code,myYear,'SOC'],['ronke','Ronke.T','F',code,otherYear,'SPO'],['dami','Dami_Reads','F',code,myYear,'ACA'],['seun','TheRealSeun','M',rival,ry,'COM']];",
          "const sims=[['kachi','Kachi Nwosu','M',code,myYear,'SOC'],['ronke','Ronke Tella','F',code,otherYear,'SPO'],['dami','Dami Ade','F',code,myYear,'ACA'],['seun','Seun Bello','M',rival,ry,'COM']];",
          label="sims names")
js = swap(js, "mk({id:'p_'+k,kind:'student',human:true,", "mk({id:'p_'+k,kind:'student',human:false,", label="sims human")
js = swap(js, "const who=ch==='Junction'?rnd(['TheRealSeun','Kachi_99','Ronke.T']):rnd(['Kachi_99','Ronke.T','Dami_Reads','Zainab (NPC)','Femi (NPC)']);pushChat(ch,who,rnd(CHAT_LINES[ch]),who.includes('NPC'))",
          "const who=ch==='Junction'?rnd(['Seun (NPC)','Kachi (NPC)','Ronke (NPC)']):rnd(['Kachi (NPC)','Ronke (NPC)','Dami (NPC)','Zainab (NPC)','Femi (NPC)']);pushChat(ch,who,rnd(CHAT_LINES[ch]),true)",
          label="simChat")
js = swap(js, "'Kachi_99 (player) sent you a friend request. Open Friends to respond.'",
          "'Kachi (NPC) sent you a friend request. Open Friends to respond.'", label="friend req")
js = swap(js, "Taken by Mr_Okoye (player). Pick another subject.", "Already taken. Pick another subject.", label="taken subject")
for leftover in ["Kachi_99", "Ronke.T", "Dami_Reads", "TheRealSeun", "Mr_Okoye", "(player)"]:
    if leftover in js:
        raise SystemExit(f"leftover simulated player text: {leftover}")

# ---------- settings panel wording ----------
js = swap(js, 'aria-label="Prototype controls"', 'aria-label="Settings"', label="gear label")
js = swap(js, "title='Prototype controls'", "title='Settings'", label="panel title")
js = swap(js, "[0.2,'Real (PRD): 1 game hour = 5 min'],[1,'Demo: 1 game min per second'],[6,'Fast']",
          "[0.2,'Relaxed'],[1,'Normal'],[6,'Fast']", label="speed labels")
js = swap(js, "In the real game the server clock never pauses.", "In the full multiplayer game, the clock never pauses.", label="clock note")
js = js.replace("Saved in this browser.", "Saved on this device.")

# ---------- write ----------
if OUT.exists():
    shutil.rmtree(OUT)
(OUT / "fonts").mkdir(parents=True)
(OUT / "index.html").write_text(page, encoding="utf8")
(OUT / "game.js").write_text(js, encoding="utf8")

# self-hosted fonts: latin and latin-ext woff2 only
css_out = ["/* Self-hosted fonts (SIL Open Font License), from @fontsource */"]
for pkg, weights in [("lilita-one", [400]), ("figtree", [400, 500, 600, 700, 800]), ("jetbrains-mono", [500, 700])]:
    for w in weights:
        css = (FONTSRC / pkg / f"{w}.css").read_text(encoding="utf8")
        for block in re.findall(r"/\* ([a-z0-9-]+) \*/\s*(@font-face \{[^}]+\})", css):
            name, face = block
            if not re.search(r"-latin(-ext)?-\d+-normal$", name):
                continue
            face = re.sub(r",\s*url\([^)]*\.woff\) format\('woff'\)", "", face)
            file = re.search(r"url\(\./files/([^)]+\.woff2)\)", face).group(1)
            shutil.copy(FONTSRC / pkg / "files" / file, OUT / "fonts" / file)
            face = face.replace("./files/", "/play/fonts/")
            css_out.append(f"/* {name} */\n{face}")
(OUT / "fonts.css").write_text("\n\n".join(css_out) + "\n", encoding="utf8")
for lic in ["lilita-one", "figtree", "jetbrains-mono"]:
    shutil.copy(FONTSRC / lic / "LICENSE", OUT / "fonts" / f"LICENSE-{lic}.txt")
print("built", OUT, "game.js", len(js), "bytes")
