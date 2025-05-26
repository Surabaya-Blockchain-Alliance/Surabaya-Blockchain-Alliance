"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BsArrowLeft } from "react-icons/bs";
import { Teko } from "next/font/google";
import { db, doc, setDoc } from "@/config";
import crypto from "crypto";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const geistTeko = Teko({
  variable: "--font-geist-teko",
  subsets: ["latin"],
});

const bgImage =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAIAAACRXR/mAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAABnSURBVHja7M5RDYAwDEXRDgmvEocnlrQS2SwUFST9uEfBGWs9c97nbGtDcquqiKhOImLs/UpuzVzWEi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1af7Ukz8xWp8z8AAAA//8DAJ4LoEAAlL1nAAAAAElFTkSuQmCC";

const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState({ username: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
      @keyframes bg-scrolling-reverse {
        100% { background-position: -50px 0; }
      }
      .fade-in {
        animation: fadeIn 3s ease-out;
      }
      @keyframes fadeIn {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }
      .navbar-slide-in {
        animation: slideIn 5s ease-out;
      }
      @keyframes slideIn {
        0% { transform: translateY(-100%); }
        100% { transform: translateY(0); }
      }
      input, textarea {
        border: 2px solid #ddd;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        font-size: 1rem;
        width: 100%;
        transition: border-color 0.3s;
      }
      input:focus, textarea:focus {
        outline: none;
        border-color: #22c55e;
      }
      textarea {
        resize: vertical;
        min-height: 100px;
      }
      button {
        background-color: #22c55e;
        color: white;
        font-weight: bold;
        padding: 0.75rem 2rem;
        border: none;
        border-radius: 9999px;
        cursor: pointer;
        transition: background-color 0.3s;
      }
      button:hover {
        background-color: #16a34a;
      }
      .error {
        color: #dc2626;
        font-size: 0.875rem;
        text-align: center;
      }
    `;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.username.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      const timestamp = new Date().toISOString();
      const docId = crypto
        .createHash("md5")
        .update(formData.email + timestamp)
        .digest("hex");

      await setDoc(doc(db, "contacts", docId), {
        username: formData.username.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
        timestamp,
      });

      setSubmitted(true);
      setFormData({ username: "", email: "", message: "" });

      toast.success("Thanks for reaching out! We'll reply within 2-24 hours.");
    } catch (err) {
      console.error("Error saving to Firestore:", err);
      setError("Failed to submit. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen text-black relative overflow-hidden">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none overflow-hidden"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundRepeat: "repeat",
          backgroundSize: "auto",
          backgroundPosition: "center",
          minHeight: "100vh",
          animation: "bg-scrolling-reverse 10s linear infinite",
        }}
      />
      <div className="relative z-10 w-full max-w-xl mx-auto py-20 px-6 fade-in">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-600 mb-10">
          <BsArrowLeft className="text-xl" />
          <span className={`font-semibold ${geistTeko.variable}`}>Back to Home</span>
        </Link>

        <h1 className="text-5xl font-bold leading-tight mb-6">
          <span className="text-gray-900">Get in</span>{" "}
          <span className="text-green-500">Touch</span>
        </h1>

        <p className="text-gray-700 font-medium mb-10">
          We'd love to connect with you! Please provide your Telegram or Discord username, email, and a message, and we'll reach out soon.
        </p>

        {submitted ? (
          <div className="bg-green-100 text-green-800 p-6 rounded-lg text-center font-semibold">
            Thank you for contacting us! We'll respond as soon as possible.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block mb-2 font-semibold text-gray-800"
              >
                Telegram or Discord Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="e.g., @YourUsername or YourUsername#1234"
              />
            </div>

            <div>
              <label htmlFor="email" className="block mb-2 font-semibold text-gray-800">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="message" className="block mb-2 font-semibold text-gray-800">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                value={formData.message}
                onChange={handleChange}
                placeholder="Write your message here..."
                rows={5}
              />
            </div>

            {error && <p className="error">{error}</p>}

            <div className="text-center">
              <button type="submit">Submit</button>
            </div>
          </form>
        )}
      </div>
      <ToastContainer position="top-center" autoClose={4000} hideProgressBar />
    </div>
  );
};

export default ContactUs;
