# Run this Website
```
npm install
npm run dev
```


# Use this for the React, Tailwind CSS, and JSON version.

### GitHub Repository Name: fcommerce-store-react-tailwind

### Vercel Project Name: fcommerce-store-react-tailwind

(Vercel Live URL: [fcommerce-store-react-tailwind.vercel.app](https://fcommerce-store-react-tailwind.vercel.app/))

# E-commerce Store for Facebook Products

A dynamic e-commerce web application built to streamline the sale of products directly from my Facebook page. This project is designed with a flexible backend architecture.

## 🚀 Tech Stack

### 🎨 Frontend (Client-side)
* **Core Library:** React.js
* **Styling:** Tailwind CSS
* **Routing:** React Router DOM
* **State Management:** Context API
* **Data Fetching:** Axios / Fetch API
* **Frontend Hosting:** Vercel / Netlify

---

### ⚙️ Backend (Server-side & Database) 

**▶ Option 1: Firebase (Primary Approach)**
* **Backend as a Service (BaaS):** Firebase
* **Authentication:** Firebase Auth (For user login/signup)
* **Database:** Cloud Firestore (Real-time NoSQL database)
* **Storage:** Firebase Storage (For storing product images)

***— OR —***

**▶ Option 2: Custom MERN Stack (Alternative Approach)**
* **Runtime Environment:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB
* **Cloud Database:** MongoDB Atlas (M0 Free Cluster)
* **Backend Hosting:** Render

---

## 🛍️ Core Features
* Fully responsive and fast user interface.
* Dynamic product showcase fetched from the database.
* Integrated shopping cart functionality.
* Seamless order placement system.


## 💳 Order & Payment System

### Payment Methods Supported
* **Cash on Delivery (COD):** Seamless checkout without upfront payment. Orders are saved in the database with a "Pending" status until successful delivery.
* **bKash (Manual Verification):** Secure manual payment system. Customers send the payment to the provided bKash number and verify their order by submitting the Transaction ID (TrxID) and Sender Number during checkout.

### 🔄 Checkout Flow
1. **Cart Calculation:** React Context API manages cart items and dynamically calculates the total price.
2. **User Details:** A responsive React form collects the customer's Name, Shipping Address, and Contact Number.
3. **Payment Selection:** * *If COD is selected:* The order is placed directly.
   * *If bKash is selected:* Extra input fields appear to securely collect the bKash TrxID and Sender Phone Number.
4. **Data Submission:** The final order object is sent to the backend (Firebase / Express API) and safely stored in the database for the admin to review.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ১. প্রোডাক্টস কালেকশনের রুলস
    match /products/{productId} {
      // যে কেউ প্রোডাক্ট দেখতে পারবে
      allow read: if true; 
      // শুধু লগইন করা ইউজার (অ্যাডমিন) প্রোডাক্ট যোগ/এডিট/ডিলিট করতে পারবে
      allow write: if request.auth != null; 
    }

    // ২. অর্ডারস কালেকশনের রুলস
    match /orders/{orderId} {
      // যে কেউ নতুন অর্ডার প্লেস (create) করতে পারবে
      allow create: if true; 
      // শুধু লগইন করা ইউজার (অ্যাডমিন) অর্ডার দেখতে, এডিট বা ডিলিট করতে পারবে
      allow read, update, delete: if request.auth != null; 
    }
    
  }
}

```
## 👨‍💻 Developed By
**Sajid**