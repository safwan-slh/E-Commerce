# Git สำหรับทำงานร่วมกับทีม

> คู่มือฉบับย่อสำหรับใช้จริงในโปรเจกต์นี้ (Express + Prisma + MySQL)
> เป้าหมาย: ประวัติ commit อ่านรู้เรื่อง, branch สะอาด, ไม่ทำคนอื่นพัง

## สารบัญ

1. [เข้าใจ 4 พื้นที่](#1-เข้าใจ-4-พื้นที่)
2. [กฎเหล็ก 7 ข้อ](#2-กฎเหล็ก-7-ข้อ)
3. [Workflow ทีมจริง](#3-workflow-ทีมจริง)
4. [ตั้งชื่อ Branch และ Commit](#4-ตั้งชื่อ-branch-และ-commit)
5. [คำสั่งที่ควรรู้](#5-คำสั่งที่ควรรู้)
6. [ยกเลิก / แก้ไขย้อนหลัง](#6-ยกเลิก--แก้ไขย้อนหลัง)
7. [แก้ Conflict](#7-แก้-conflict)
8. [ตั้งค่า Git ให้ฉลาดขึ้น](#8-ตั้งค่า-git-ให้ฉลาดขึ้น)
9. [PR ให้ดูมืออาชีพ](#9-pr-ให้ดูมืออาชีพ)
10. [ซ้อมกับ Repo นี้](#10-ซ้อมกับ-repo-นี้)
11. [ข้อห้ามที่ทำให้ดูมือใหม่](#11-ข้อห้ามที่ทำให้ดูมือใหม่)
12. [Cheat Sheet](#12-cheat-sheet)

---

## 1. เข้าใจ 4 พื้นที่

```
Working Directory  →  Staging (index)  →  Local Repo  →  Remote (GitHub)
     แก้ไฟล์            git add            git commit       git push
```

| พื้นที่ | อยู่ไหน | คำสั่งที่เกี่ยวข้อง |
|---|---|---|
| Working Directory | ไฟล์ในเครื่องที่กำลังแก้ | `git status`, `git diff` |
| Staging | รายการที่จะเข้า commit ถัดไป | `git add`, `git restore --staged` |
| Local Repo | ประวัติ commit ในเครื่อง | `git commit`, `git log` |
| Remote | GitHub (`origin`) | `git push`, `git pull`, `git fetch` |

**จุดที่คนมักข้าม:** `git add -p` (เลือกทีละ hunk) — ทำให้ commit เล็กและเป็นเรื่องเดียว ซึ่งเป็นสิ่งที่ทีมงานมืออาชีพทำกันจริง

---

## 2. กฎเหล็ก 7 ข้อ

1. **1 commit = 1 เรื่อง** — ถ้าต้องเขียน "and" ในข้อความ commit แปลว่าควรแยก
2. **ห้าม commit `.env` / secret / `node_modules`** — โปรเจกต์นี้ ignore ไว้แล้ว
3. **ห้าม force push ลง `main`** เด็ดขาด
4. **pull ก่อน push เสมอ**
5. **1 branch = 1 งาน** — อย่าแก้หลายเรื่องใน branch เดียว
6. **commit message บอก "ทำไม"** ไม่ใช่แค่ "แก้โค้ด"
7. **PR เล็ก** (~ไม่เกิน 400 บรรทัด) — review ง่ายและ merge เร็ว

---

## 3. Workflow ทีมจริง

```bash
# 1. อัปเดต main ล่าสุด
git switch main
git pull --ff-only

# 2. แตก branch ใหม่
git switch -c feat/login-jwt

# 3. เขียนโค้ด แล้ว commit เป็นก้อนเล็ก ๆ
git add -p
git commit -m "feat(auth): sign JWT on successful login"

git add -p
git commit -m "feat(auth): return 401 for invalid credentials"

# 4. push ครั้งแรกของ branch
git push -u origin feat/login-jwt

# 5. เปิด PR
gh pr create --fill

# 6. หลัง merge แล้ว กลับมา sync
git switch main
git pull --ff-only
git branch -d feat/login-jwt
```

> ใช้ `git switch` แทน `git checkout` — อ่านง่ายกว่าและเป็นคำสั่งสมัยใหม่

---

## 4. ตั้งชื่อ Branch และ Commit

### Branch

```
feat/login-jwt
fix/cart-total-rounding
refactor/auth-controller
docs/env-setup
chore/upgrade-prisma
```

รูปแบบ: `type/เรื่องที่ทำ` โดยใช้ตัวพิมพ์เล็กและขีดกลาง

### Commit (Conventional Commits)

```
feat(auth): add JWT login endpoint
fix(cart): round cart total to 2 decimals
docs(readme): add setup instructions
refactor(auth): extract token signing
test(auth): cover disabled user login
chore(deps): bump prisma to 7.10.1
```

รูปแบบ: `type(scope): คำอธิบาย`

| Type | ใช้เมื่อ |
|---|---|
| `feat` | เพิ่มฟีเจอร์ |
| `fix` | แก้บั๊ก |
| `docs` | เอกสารเท่านั้น |
| `refactor` | ปรับโครงสร้างโค้ด ไม่เปลี่ยนพฤติกรรม |
| `test` | เพิ่ม/แก้ test |
| `chore` | งานจิปาฐะ เช่น dependency, config |
| `perf` | ปรับperformance |
| `build` / `ci` | ระบบ build หรือ CI |

ถ้าต้องอธิบายเพิ่ม ใส่ body หลังบรรทัดว่าง:

```
fix(auth): use correct enable field

Prisma schema uses `enable`, but the controller checked `enabled`,
so every login was rejected. Also fixed the inverted password
error message.
```

**หลักการเขียน:** ใช้คำสั่ง (imperative) — `add`, `fix`, `remove` ไม่ต้องมีจุดท้าย และบรรทัดแรกไม่เกิน ~72 ตัวอักษร

---

## 5. คำสั่งที่ควรรู้

### ดูสถานะแบบโปร

```bash
git status -sb
git log --oneline --graph --decorate --all
git diff              # ยังไม่ stage
git diff --staged     # stage แล้ว
git show HEAD         # commit ล่าสุดแก้อะไร
git blame controllers/auth.js   # ใครแก้บรรทัดไหน
```

### ทำงานกับ branch

```bash
git branch                    # ดู branch local
git branch -a                 # ดูทั้งหมดรวม remote
git switch main               # ย้าย branch
git switch -c feat/new-thing  # สร้าง + ย้าย
git branch -d feat/old        # ลบ branch ที่ merge แล้ว
```

### เก็บงานค้าง

```bash
git stash push -m "wip login"
git stash list
git stash pop                 # เอากลับมาและลบ stash
git stash apply               # เอากลับมาแต่เก็บ stash ไว้
```

### ดึง/ส่งงาน

```bash
git fetch --all --prune       # ดึงข้อมูล remote โดยไม่ merge
git pull --ff-only            # pull แบบไม่สร้าง merge commit
git push -u origin feat/x     # push ครั้งแรกของ branch
git push                      # ครั้งต่อไป
```

---

## 6. ยกเลิก / แก้ไขย้อนหลัง

| อยากทำอะไร | คำสั่ง | หมายเหตุ |
|---|---|---|
| ทิ้งการแก้ไฟล์ที่ยังไม่ commit | `git restore ไฟล์` | กู้คืนไม่ได้ |
| เอาไฟล์ออกจาก staging | `git restore --staged ไฟล์` | ไฟล์ยังอยู่ |
| แก้ข้อความ commit ล่าสุด | `git commit --amend` | ใช้ก่อน push |
| เพิ่มไฟล์ลืมเข้า commit ล่าสุด | `git add ไฟล์` + `git commit --amend --no-edit` | ใช้ก่อน push |
| ยกเลิก commit ล่าสุด แต่เก็บโค้ด | `git reset --soft HEAD~1` | ปลอดภัย |
| ยกเลิก commit ที่ push แล้ว | `git revert <sha>` | ปลอดภัยกับทีม |
| หา commit ที่เผลอ reset หาย | `git reflog` | ช่วยชีวิตได้ |
| ดูว่าใครแก้อะไร | `git log -p -- ไฟล์` | |

> `git reset --hard` = ลบงานทิ้งจริง ใช้เฉพาะเมื่อมั่นใจ
> ถ้าจำเป็นต้อง force push บน branch ของตัวเอง ใช้ `git push --force-with-lease` (ปลอดภัยกว่า `--force`)

---

## 7. แก้ Conflict

Conflict ไม่ใช่ error แต่คือ Git บอกว่า "สองคนแก้จุดเดียวกัน ช่วยตัดสินใจหน่อย"

สมมติ `main` มีคนแก้ไฟล์เดียวกับ branch เรา:

```bash
git switch main
git pull --ff-only

git switch feat/login-jwt
git rebase main
```

ในไฟล์จะมี marker:

```
<<<<<<< HEAD
โค้ดฝั่ง main
=======
โค้ดฝั่ง branch เรา
>>>>>>> feat/login-jwt
```

ขั้นตอน:

1. เปิดไฟล์ แก้ให้เหลือโค้ดที่ถูกต้อง แล้วลบ marker ทั้ง 3 แบบออก
2. `git add ไฟล์ที่แก้`
3. `git rebase --continue`
4. ถ้าอยากเลิกรับ: `git rebase --abort`
5. เมื่อ rebase เสร็จ ต้อง `git push --force-with-lease`

> VS Code มีปุ่ม Accept Current / Incoming / Both ช่วยแก้ conflict ได้

---

## 8. ตั้งค่า Git ให้ฉลาดขึ้น

ทำครั้งเดียวต่อเครื่อง:

```bash
git config --global pull.rebase true
git config --global fetch.prune true
git config --global rerere.enabled true
git config --global init.defaultBranch main
git config --global alias.lg "log --oneline --graph --decorate --all"
git config --global alias.st "status -sb"
```

| ค่า | ประโยชน์ |
|---|---|
| `pull.rebase` | ประวัติเป็นเส้นตรง ไม่มี merge commit ขยะ |
| `fetch.prune` | ลบ remote branch ที่ถูกลบไปแล้วออกจากเครื่อง |
| `rerere` | จำวิธีแก้ conflict เดิมและแก้ให้อัตโนมัติครั้งหน้า |
| alias `lg`, `st` | พิมพ์สั้นลง |

---

## 9. PR ให้ดูมืออาชีพ

```bash
gh pr create --fill            # ใช้ commit message เป็นชื่อ PR
gh pr create --draft           # เปิดเป็น draft ก่อน
gh pr view --web               # เปิดใน browser
gh pr checks                   # ดู CI
gh pr merge --squash --delete-branch
```

PR ที่ดีควรมี:

- **ชื่อชัดเจน** เช่น `feat(auth): JWT login`
- **What / Why** — ทำอะไร เพราะอะไร
- **How to test** — ขั้นตอนให้ reviewer ลอง
- **Screenshot** ถ้าเป็น UI
- **ไม่ปนหลายเรื่อง**

ก่อนเปิด PR ให้ review ตัวเองด้วย:

```bash
git diff main...HEAD
```

---

## 10. ซ้อมกับ Repo นี้

```bash
cd /Users/macbook/Documents/PROJECT-WEB/api-workshop2/server

# 1. แตก branch ซ้อม
git switch -c practice/git-basics

# 2. สร้างไฟล์
echo "# Git Practice" > GIT-PRACTICE.md
git add GIT-PRACTICE.md
git commit -m "docs: add git practice notes"

# 3. แก้แล้ว commit อีกก้อน (ลอง git add -p)
echo "Learned: small commits > big commits" >> GIT-PRACTICE.md
git add -p
git commit -m "docs: note small commit strategy"

# 4. push + เปิด PR แบบ draft
git push -u origin practice/git-basics
gh pr create --fill --draft

# 5. ดูประวัติสวย ๆ
git lg

# 6. merge แบบ squash แล้วลบ branch
gh pr merge --squash --delete-branch

# 7. sync main
git switch main
git pull --ff-only
```

### ซ้อมแก้ conflict

```bash
# branch A แก้ README
git switch -c practice/conflict-a
# แก้บรรทัดหนึ่งใน README.txt แล้ว commit

# branch B แก้บรรทัดเดียวกันคนละแบบ
git switch main
git switch -c practice/conflict-b
# แก้บรรทัดเดียวกัน แล้ว commit

# เอา A มารวมกับ B
git switch practice/conflict-a
git rebase practice/conflict-b   # จะเกิด conflict
# แก้ marker, git add, git rebase --continue
```

---

## 11. ข้อห้ามที่ทำให้ดูมือใหม่

| ❌ อย่าทำ | ✅ ทำแทน |
|---|---|
| `git add .` ทุกครั้ง | `git add -p` หรือระบุไฟล์ |
| commit ว่า "update", "fix", "งาน" | `fix(auth): ...` |
| commit `node_modules` | มี `.gitignore` |
| force push `main` | push branch ตัวเอง + PR |
| แก้ไฟล์คนอื่นใน branch ตัวเองโดยไม่บอก | คุยก่อน หรือแตก branch ใหม่ |
| merge PR ตัวเองทั้งที่ยังไม่ review | ขอ review ก่อน |
| ทิ้ง branch ค้างเป็นสิบ ๆ | merge แล้วลบ |

---

## 12. Cheat Sheet

```bash
# เริ่มงาน
git switch main && git pull --ff-only
git switch -c feat/my-feature

# ระหว่างทำงาน
git status -sb
git diff
git add -p
git commit -m "feat(scope): message"

# ส่งงาน
git push -u origin feat/my-feature
gh pr create --fill

# หลัง merge
git switch main && git pull --ff-only
git branch -d feat/my-feature

# ดูประวัติ
git lg
git log --oneline -10

# ช่วยชีวิต
git restore <file>
git restore --staged <file>
git commit --amend
git reset --soft HEAD~1
git revert <sha>
git reflog
```

---

_อ้างอิง: [Pro Git Book](https://git-scm.com/book/th/v2) · [Conventional Commits](https://www.conventionalcommits.org/)_
