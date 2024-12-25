# FlavourScape 🍽️

This is a full-stack restaurant management website designed using the MERN stack (MongoDB, Express.js, React.js, Node.js). The platform aims to provide a user-friendly experience for customers and staff, streamlining operations while enhancing online engagement.

---

## 🔗 Live Demo
https://assignment-11-c95a9.web.app

---


## ✨ Key Features
### General
- Fully responsive for mobile, tablet, and desktop.
- Secure Firebase and MongoDB credentials using environment variables.
- Light and dark mode with a customizable theme toggling feature.

### Public Pages
1. **Homepage**:
   - Banner section with a title, description, and button redirecting to the All Foods page.
   - Top Foods section showing six top-selling food items with a "See All" button.
   - Two additional relevant and attractive sections.

2. **All Foods Page**:
   - Displays all food items with a search functionality.
   - Pagination for better navigation (9 items per page).

3. **Single Food Page**:
   - Shows detailed information about a specific food item.
   - Includes purchase count and a purchase button.

4. **Gallery Page**:
   - Displays a gallery of at least 10 static images.
   - Hover effects with overlays and a lightbox feature for larger image viewing.

### Private Pages
1. **My Foods**:
   - Displays food items added by the logged-in user.
   - Update functionality using a modal or a separate page.

2. **Add Food**:
   - Form for adding a new food item (with fields like name, image, category, price, and description).
   - Stores data in the database and shows a success alert on completion.

3. **My Orders**:
   - Displays food items ordered by the user.
   - Shows purchase date in a human-readable format.
   - Delete functionality for removing orders.

4. **Food Purchase Page**:
   - Form to purchase a food item, capturing details like buyer name, email, and quantity.
   - Disabled purchase button when food quantity is unavailable.

---

## 🛠️ Technologies Used
- **Frontend**: React.js, Tailwind CSS, DaisyUI
- **Backend**: Node.js, Express.js, MongoDB
- **Authentication**: Firebase
- **Libraries**:
  - Swiper (for banners/sliders)
  - Yet-Another-React-Lightbox (for gallery)
  - SweetAlert (for alerts)
  - Moment.js (for date formatting)

---

## 🌟 Authentication System
- Email and password-based login/registration.
- Social login via Google or GitHub.
- JWT authentication for private routes.



---

## 🧩 Optional Features
- Loading spinners for data fetching.
- Pagination


