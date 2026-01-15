# TaskGlitch – Bug Fix Assignment

TaskGlitch is a task management web application built for sales teams to track tasks, prioritize work using ROI (Return on Investment), and analyze performance metrics.

This repository contains the **fixed version** of the application, where multiple real-world UI, logic, and performance bugs were identified and resolved as part of a bug-fix challenge.

---

## 📦 GitHub Repository

👉 https://github.com/Firoz-S/task-glitch

---

## 🧾 Project Overview

Each task includes:

- Title
- Revenue
- Time Taken
- ROI (Revenue ÷ Time Taken)
- Priority (High / Medium / Low)
- Status (Todo / In Progress / Done)
- Notes

---

## ⚙️ Core Features

- Add, edit, and delete tasks
- View task details and notes
- Search and filter by status and priority
- ROI-based task sorting
- Performance analytics and insights
- CSV export of tasks
- Undo delete functionality using a snackbar

---

## 🐞 Bugs Fixed

### ✅ Bug 1: Double Fetch Issue

**Problem:**  
Tasks were loaded twice on page load due to React StrictMode behavior.

**Fix:**  
Added a `useRef` guard to ensure data fetching executes only once.

---

### ✅ Bug 2: Undo Snackbar Restoring Stale Tasks

**Problem:**  
Closing the undo snackbar did not reset deleted task state, causing older tasks to reappear.

**Fix:**  
Implemented proper cleanup of deleted task state when the snackbar closes.

---

### ✅ Bug 3: Unstable Task Sorting

**Problem:**  
Tasks with equal ROI and priority reordered randomly on re-renders.

**Fix:**  
Added a deterministic tie-breaker to ensure stable and predictable sorting.

---

### ✅ Bug 4: Multiple Dialogs Opening

**Problem:**  
Clicking Edit or Delete triggered both View and Edit dialogs due to event bubbling.

**Fix:**  
Stopped event propagation on action buttons so only the intended dialog opens.

---

### ✅ Bug 5: ROI Calculation Errors

**Problem:**  
ROI showed `NaN`, `Infinity`, or incorrect values when inputs were invalid.

**Fix:**

- Validated revenue and time inputs
- Prevented division by zero
- Ensured consistent numeric formatting

---

## 🛠️ Tech Stack

- **React**
- **TypeScript**
- **Vite**
- **Material UI**
- **Vercel** (Deployment)

---

## 🧪 Local Setup

```bash
npm install
npm run dev
```
