#!/usr/bin/env python3
"""
Bruno's Portfolio Launcher
Click-to-run GUI for git commits and KingHost deploys.
"""
import tkinter as tk
from tkinter import scrolledtext, messagebox
import subprocess
import threading
import os
import sys

WORK_DIR = os.path.dirname(os.path.abspath(__file__))

BG     = '#1e1e2e'
CARD   = '#2a2a3e'
INPUT  = '#313244'
FG     = '#cdd6f4'
ACCENT = '#89b4fa'
GREEN  = '#a6e3a1'
RED    = '#f38ba8'
YELLOW = '#f9e2af'

if sys.platform == 'darwin':
    FONT = ('Helvetica Neue', 13)
    MONO = ('Menlo', 12)
else:
    FONT = ('Segoe UI', 11)
    MONO = ('Consolas', 11)


class App(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Bruno's Portfolio Launcher")
        self.configure(bg=BG, padx=14, pady=14)
        self.resizable(True, True)
        self._busy = False
        self._build_ui()
        self.geometry('700x740')

    # ─── UI construction ────────────────────────────────────────────────────

    def _build_ui(self):
        # Title
        tk.Label(self, text="Bruno's Portfolio Launcher",
                 font=(FONT[0], 17, 'bold'), bg=BG, fg=ACCENT
                 ).pack(pady=(0, 12))

        self._build_git_section()
        self._build_deploy_section()
        self._build_output_section()

    def _build_git_section(self):
        frame = self._card(" Git — save to GitHub ")

        steps = [
            ("git add .",   "Marks all changed files as 'ready to save'"),
            ("git commit",  "Takes a snapshot with your message"),
            ("git push",    "Uploads that snapshot to GitHub"),
        ]
        for cmd, desc in steps:
            row = tk.Frame(frame, bg=CARD)
            row.pack(fill='x', pady=1)
            tk.Label(row, text=f"  {cmd}", font=(MONO[0], MONO[1], 'bold'),
                     bg=CARD, fg=YELLOW, width=15, anchor='w').pack(side='left')
            tk.Label(row, text=f"— {desc}", font=FONT,
                     bg=CARD, fg=FG).pack(side='left')

        # Commit message input
        msg_row = tk.Frame(frame, bg=CARD)
        msg_row.pack(fill='x', pady=(10, 4))
        tk.Label(msg_row, text="Commit message:", font=FONT,
                 bg=CARD, fg=FG).pack(side='left')
        self.commit_msg = tk.Entry(
            msg_row, font=MONO, bg=INPUT, fg=FG,
            insertbackground=FG, relief='flat', bd=5)
        self.commit_msg.pack(side='left', fill='x', expand=True, padx=(8, 0))
        self.commit_msg.insert(0, "update portfolio")

        # Buttons
        btn_row = tk.Frame(frame, bg=CARD)
        btn_row.pack(fill='x', pady=(8, 0))

        self.b_add    = self._btn(btn_row, "git add .",    self._git_add,    ACCENT)
        self.b_commit = self._btn(btn_row, "git commit",   self._git_commit, ACCENT)
        self.b_push   = self._btn(btn_row, "git push",     self._git_push,   ACCENT)
        self.b_gitall = self._btn(btn_row, "▶  Add + Commit + Push", self._git_all, GREEN)

        self.b_add.pack(side='left', padx=(0, 6))
        self.b_commit.pack(side='left', padx=(0, 6))
        self.b_push.pack(side='left', padx=(0, 6))
        self.b_gitall.pack(side='right')

    def _build_deploy_section(self):
        frame = self._card(" Deploy — go live on KingHost ")

        # Password row
        pw_row = tk.Frame(frame, bg=CARD)
        pw_row.pack(fill='x', pady=(0, 8))
        tk.Label(pw_row, text="FTP Password:", font=FONT,
                 bg=CARD, fg=FG).pack(side='left')
        self.pw_var = tk.StringVar()
        self.pw_entry = tk.Entry(
            pw_row, textvariable=self.pw_var, font=MONO,
            bg=INPUT, fg=FG, insertbackground=FG,
            show='•', relief='flat', bd=5)
        self.pw_entry.pack(side='left', fill='x', expand=True, padx=(8, 4))
        self._pw_visible = False
        tk.Button(pw_row, text="👁", bg=CARD, fg=FG, relief='flat',
                  cursor='hand2', font=(FONT[0], 13),
                  command=self._toggle_pw).pack(side='left')

        steps = [
            ("npm run build",  "Compiles the site into the dist/ folder"),
            ("deploy_ftp.py",  "Uploads only changed files to the KingHost server"),
        ]
        for cmd, desc in steps:
            row = tk.Frame(frame, bg=CARD)
            row.pack(fill='x', pady=1)
            tk.Label(row, text=f"  {cmd}", font=(MONO[0], MONO[1], 'bold'),
                     bg=CARD, fg=YELLOW, width=18, anchor='w').pack(side='left')
            tk.Label(row, text=f"— {desc}", font=FONT,
                     bg=CARD, fg=FG).pack(side='left')

        # Buttons
        btn_row = tk.Frame(frame, bg=CARD)
        btn_row.pack(fill='x', pady=(8, 0))

        self.b_build  = self._btn(btn_row, "npm run build",    self._npm_build,       ACCENT)
        self.b_deploy = self._btn(btn_row, "Deploy to KingHost", self._deploy,         ACCENT)
        self.b_bdall  = self._btn(btn_row, "▶  Build + Deploy", self._build_and_deploy, GREEN)

        self.b_build.pack(side='left', padx=(0, 6))
        self.b_deploy.pack(side='left', padx=(0, 6))
        self.b_bdall.pack(side='right')

    def _build_output_section(self):
        out_lf = tk.LabelFrame(self, text=" Output ", font=FONT,
                                bg=BG, fg=ACCENT, bd=0, padx=4, pady=4)
        out_lf.pack(fill='both', expand=True, pady=(10, 0))

        self.output = scrolledtext.ScrolledText(
            out_lf, font=MONO, bg='#11111b', fg=FG,
            relief='flat', bd=0, state='disabled', height=14)
        self.output.pack(fill='both', expand=True)
        self.output.tag_config('cmd',     foreground=ACCENT, font=(MONO[0], MONO[1], 'bold'))
        self.output.tag_config('success', foreground=GREEN)
        self.output.tag_config('error',   foreground=RED)

        tk.Button(out_lf, text="Clear output", font=FONT,
                  bg=CARD, fg=FG, relief='flat', cursor='hand2',
                  command=self._clear).pack(pady=(4, 0))

    # ─── Helpers ────────────────────────────────────────────────────────────

    def _card(self, title):
        lf = tk.LabelFrame(self, text=title, font=FONT,
                            bg=CARD, fg=ACCENT, bd=0,
                            padx=12, pady=10)
        lf.pack(fill='x', pady=(0, 10))
        return lf

    def _btn(self, parent, text, command, color):
        return tk.Button(parent, text=text, command=command,
                         font=FONT, bg=color, fg='#1e1e2e',
                         relief='flat', padx=10, pady=6,
                         cursor='hand2', activebackground=color)

    def _toggle_pw(self):
        self._pw_visible = not self._pw_visible
        self.pw_entry.config(show='' if self._pw_visible else '•')

    def _clear(self):
        self.output.config(state='normal')
        self.output.delete('1.0', tk.END)
        self.output.config(state='disabled')

    def _all_buttons(self):
        return [self.b_add, self.b_commit, self.b_push, self.b_gitall,
                self.b_build, self.b_deploy, self.b_bdall]

    def _set_buttons(self, enabled):
        state = 'normal' if enabled else 'disabled'
        for b in self._all_buttons():
            b.config(state=state)

    def _write(self, text, tag=None):
        """Thread-safe write to output widget."""
        def _do():
            self.output.config(state='normal')
            if tag:
                self.output.insert(tk.END, text, tag)
            else:
                self.output.insert(tk.END, text)
            self.output.see(tk.END)
            self.output.config(state='disabled')
        self.after(0, _do)

    def _exec(self, cmd, env=None):
        """Run a shell command, stream output, return True on success."""
        self._write(f"\n$ {cmd}\n", 'cmd')
        try:
            proc = subprocess.Popen(
                cmd, shell=True,
                stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                text=True, cwd=WORK_DIR, env=env)
            for line in proc.stdout:
                self._write(line)
            proc.wait()
            if proc.returncode == 0:
                self._write("✓ Done\n", 'success')
            else:
                self._write(f"✗ Failed (exit {proc.returncode})\n", 'error')
            return proc.returncode == 0
        except Exception as e:
            self._write(f"Error: {e}\n", 'error')
            return False

    def _thread(self, fn):
        if self._busy:
            messagebox.showwarning("Busy", "A command is already running.")
            return
        self._busy = True
        self._set_buttons(False)

        def wrapper():
            try:
                fn()
            finally:
                self._busy = False
                self.after(0, lambda: self._set_buttons(True))

        threading.Thread(target=wrapper, daemon=True).start()

    def _ftp_env(self):
        """Return env dict with FTP_PASSWORD, or None if field is empty."""
        pw = self.pw_var.get().strip()
        if not pw:
            messagebox.showerror("Password required",
                                 "Please enter the FTP password before deploying.")
            return None
        env = os.environ.copy()
        env['FTP_PASSWORD'] = pw
        return env

    # ─── Actions ────────────────────────────────────────────────────────────

    def _git_add(self):
        self._thread(lambda: self._exec("git add ."))

    def _git_commit(self):
        msg = self.commit_msg.get().strip() or "update portfolio"
        self._thread(lambda: self._exec(f'git commit -m "{msg}"'))

    def _git_push(self):
        self._thread(lambda: self._exec("git push"))

    def _git_all(self):
        msg = self.commit_msg.get().strip() or "update portfolio"
        def do():
            self._exec("git add .")
            self._exec(f'git commit -m "{msg}"')
            self._exec("git push")
        self._thread(do)

    def _npm_build(self):
        self._thread(lambda: self._exec("npm run build"))

    def _deploy(self):
        env = self._ftp_env()
        if env is None:
            return
        self._thread(lambda: self._exec("python3 deploy_ftp.py", env=env))

    def _build_and_deploy(self):
        env = self._ftp_env()
        if env is None:
            return
        def do():
            ok = self._exec("npm run build")
            if ok:
                self._exec("python3 deploy_ftp.py", env=env)
        self._thread(do)


if __name__ == '__main__':
    app = App()
    app.mainloop()
