# SkillShift - Local Hosting Guide

This guide explains how to run the SkillShift application on your local machine.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)

## Setup Instructions

1.  **Clone the repository** (or download the source code).
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Configure Environment Variables**:
    - Copy the `.env.example` file to a new file named `.env`:
      ```bash
      cp .env.example .env
      ```
    - Open the `.env` file and add your **Gemini API Key**:
      ```env
      VITE_GEMINI_API_KEY=your_actual_api_key_here
      ```
    - (Optional) Update the Firebase configuration if you want to use your own Firebase project.

4.  **Run the development server**:
    ```bash
    npm run dev
    ```
5.  **Access the app**:
    Open your browser and navigate to `http://localhost:3000` (or the port shown in your terminal).

## Building for Production

To create a production-ready build:
```bash
npm run build
```
The output will be in the `dist/` folder.

## Technologies Used

- **React 19**
- **Vite**
- **Tailwind CSS**
- **Firebase** (Auth & Firestore)
- **Google Gemini AI** (@google/genai)
