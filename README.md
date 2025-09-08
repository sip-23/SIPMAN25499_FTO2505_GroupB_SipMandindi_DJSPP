# 🎧 DJS Portfolio Piece – Podcast App (React)

## 📋 Overview

This is Sippi-Cup Podcasts. Your Podcast App for all your `History`, `Journalism`, `Personal Growth Tips` and more. We seek to keep you up to date on Old and New Podcasts to allow you to know more. From your `latest celebrity gossip` and `financial news` to listening to your favourite music, **we have it all**!

![Sippi-Cup Podcasts logo](</Logo/SippiCupPod%20Logo%20Light.png>)

So far, the app already includes a landing page with:
- searchable, 
- sortable, and 
- filterable podcast previews, as well as a 
- show detail page with season toggling.

Now we Introduces key new features including
- **global audio playback**, 
- **favouriting episodes**, 
- **deployment best practices**, 
- **UI enhancements**, and 
- **optional listening progress tracking**.

### The Goal:
Build a polished, production-ready React application that offers an engaging and seamless user experience.

> **Tip:** Explore the React ecosystem to help implement features efficiently.

## 🎯 Objectives

- Implementing a global audio player with full playback control
- Adding support for favouriting episodes with persistent storage
- Introducing a recommended shows carousel on the landing page
- Supporting theme toggling (light/dark mode)
- Ensuring robust routing and deploy the app with professional polish
- Optionally track listening progress across episodes and sessions

## 🚀 Core Features & User Stories

### 🛠️ Setup and Deployment

- I the used provided wireframe in the wireframe reference images folder for guidance on how to build the UI structure to implement my Prototype.
- I designed a visually appealing UI Prototype with clear layout and hierarchy using Figma.
  - Check updated : [Figma design Link](https://www.figma.com/design/5vvqOdJYHcn6BMR8QZ5WPA/Prototyping-in-Figma?node-id=3833-2013&t=Ym4md3F2PlKb4uD4-0)
- Use a consistent **colour scheme, typography, spacing, and sizing**.
- I deployed this app to **Vercel** using my **custom domain or URL**
  - Please use the following updated link: [Sippi-Cup Podcasts Vercel Deployment Link](https://aws.amazon.com/free/webapps/?trk=accbfd85-cb9b-42bf-9a67-f3103fcaa74e&sc_channel=ps&ef_id=CjwKCAjw2vTFBhAuEiwAFaScwlmGJILp335PL0feTbYfXQZegrMm2XPuFhNCM4p2TSS34AZWfHXazBoCtpEQAvD_BwE:G:s&s_kwcid=AL!4422!3!645060134137!p!!g!!web%20server%20host!19574556881!145779844512&gad_campaignid=19574556881&gbraid=0AAAAADjHtp_-XnyA9YENpMG7FH5NhvaJ4&gclid=CjwKCAjw2vTFBhAuEiwAFaScwlmGJILp335PL0feTbYfXQZegrMm2XPuFhNCM4p2TSS34AZWfHXazBoCtpEQAvD_BwE)
- I added a **custom favicon** for easy identification in browser tabs which looks like this:

![Sippi-Cup Podcasts custom favicon](</Logo/SippiCup_favicon.png>)

- I Used tools like: [metatags.io](https://metatags.io) to set **rich social media preview metadata**
- The direct access to dynamic routes (e.g. `/show/1`) works correctly (SPA routing fallback)

### 🔊 Global Audio Player

- Able to Play audio using the provided **placeholder API**
- The player is **fixed at the bottom** of the screen across all pages
- There is **uninterrupted playback** when navigating between pages
- I Provided **play, pause, seek, and progress tracking**
- I Added a **confirmation prompt** on page reloads during playback

### ❤️ Favourites

- I allow users to **favourite or unfavourite episodes** via a button/icon
- I used **localStorage** to persist favourites across sessions
- I provided **visual feedback** for favourited items (e.g., filled heart)
- I created a **favourites page** displaying all saved episodes
- I display **associated show and season** for each favourite
- I show the **date/time added** to favourites
- The user will be able to **Group favourites by show title**
- I added **sorting options**:
  - A–Z / Z–A by title
  - Newest / Oldest by date added

### 🎠 Recommended Shows Carousel

- I added a **horizontally scrollable carousel** to the landing page
- I showed each show’s **image, title, and genre tags**
- The App support **looping** and navigation via **swipe or arrows**
- Clicking a carousel item should navigate to the **show’s detail page**

### 🌗 Theme Toggle

- I included a **toggle** for switching between light and dark mode
- There is a **Persistant theme selection** using `localStorage`
- The **entire app UI updates smoothly**
- I used **appropriate icons** (e.g., sun/moon) to indicate current theme
- The App reflects selected theme across all views and components

## 🌟 Stretch Goal – Listening Progress (Optional)

- The user is able to save playback position per episode and **resume playback**
- The user is able to Mark episodes as **"finished"** once fully played
- The App can Display **progress indicators** for episodes in progress
- The App allow users to **reset listening history**
- The App can save listening history in local storage

## ✅ Deliverables

- A fully functional and deployed podcast app (See Deployed app link above)
- Source code in **GitHub** with clear commit history
- Live demo link (**Vercel**)
- (Optional) Short demo video

## 💡 Tips

- Prioritise **user experience** and **clean component structure**
- Use **React best practices** (components, hooks, state management)
- Ensure the app is **responsive** and **mobile-friendly**
- Test localStorage and audio persistence thoroughly
- Make use of the **React ecosystem** to accelerate development!

---

## 🧑‍⚖️ Panel Review

After submitting your project, you will be required to present your work to a coach or panel of coaches.

During this session, you must:

- **Demonstrate** all the features you have implemented in your application.
- **Explain** how each feature was built, referring directly to your code (e.g., components, state, hooks, storage).
- Discuss the **decisions** you made during development (e.g., choice of libraries, structure, naming conventions).
- Break down the **logic** behind key functionalities (e.g., how audio persistence or favouriting works).
- Be prepared to answer **questions** from the coaches about your project, code structure, and implementation choices.

This is your opportunity to showcase both your technical and problem-solving skills—treat it like a real-world project revsiew.
