import React, { useState } from "react";
import { BsArrowRight } from "react-icons/bs";
import { db, doc, setDoc } from "@/config";
import crypto from "crypto";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SocialIcon from "@/components/social-icon";
import UnderlineButton from "@/components/button/underlined";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState({ username: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { username, email, message } = formData;

    if (!username.trim() || !email.trim() || !message.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      const timestamp = new Date().toISOString();
      const docId = crypto.createHash("md5").update(email + timestamp).digest("hex");

      await setDoc(doc(db, "contacts", docId), {
        username: username.trim(),
        email: email.trim(),
        message: message.trim(),
        timestamp,
      });

      setSubmitted(true);
      setFormData({ username: "", email: "", message: "" });

      toast.success("Thanks for reaching out! We'll reply within 2–24 hours.");
    } catch (err) {
      console.error("Error saving to Firestore:", err);
      setError("Failed to submit. Please try again later.");
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden text-black bg-white p-20">
      <ToastContainer position="top-right" autoClose={4000} hideProgressBar />

      <div className="flex justify-between gap-8">
        {/* Left Column */}
        <div className="space-y-3">
          <h1 className="text-9xl font-bold">Let's get in touch</h1>
          <h2 className="text-2xl font-medium">Don't be afraid to say hello with us!</h2>

          <footer className="footer bg-white text-black items-center sticky bottom-0 top-full">
            <aside className="grid-flow-col items-center">
              <img src="/img/emblem.png" alt="Logo" className="h-full" width={46} />
              <p className="font-semibold">Cardano Hub Indonesia</p>
            </aside>
            <nav className="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
              <SocialIcon href={process.env.URL_TWITTER ?? "#"} type="twitter" />
              <SocialIcon href={process.env.URL_DISCORD ?? "#"} type="discord" />
              <SocialIcon href={process.env.URL_TELEGRAM ?? "#"} type="telegram" />
            </nav>
          </footer>
        </div>

        <div className="divider lg:divider-horizontal"></div>

        {/* Right Column */}
        <div className="space-y-3 w-full">
          <div className="flex items-center justify-end gap-8">
            <BsArrowRight className="text-9xl" />
            <p className="text-gray-700 font-medium">
              We'd love to connect with you! Please provide your Telegram or Discord
              username, email, and a message, and we'll reach out soon.
            </p>
          </div>

          <div className="flex items-center justify-center w-full">
            {submitted ? (
              <div className="space-y-10 text-center">
                <DotLottieReact
                  src="https://lottie.host/f3991647-9683-47a1-9d71-ab58620022ef/tSdx2j6aOR.lottie"
                  loop
                  autoplay
                  style={{ width: "100%", maxWidth: "100%", margin: "0 auto" }}
                />
                <UnderlineButton
                  href="/"
                  target="_self"
                  label="Thank you for connecting with us!"
                  textColor="text-black"
                  underlineColor="bg-black"
                  iconColor="text-black"
                />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 w-full">
                <div className="flex justify-between items-center gap-4">
                  <div className="w-full">
                    <label htmlFor="username" className="block mb-2 font-semibold text-gray-800">
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
                      className="w-full border-0 border-b-2 border-gray-300 focus:border-gray-900 focus:outline-none px-2 py-1"
                    />
                  </div>
                  <div className="w-full">
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
                      className="w-full border-0 border-b-2 border-gray-300 focus:border-gray-900 focus:outline-none px-2 py-1"
                    />
                  </div>
                </div>

                <div className="w-full">
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
                    className="w-full border-0 border-b-2 border-gray-300 focus:border-gray-900 focus:outline-none px-2 py-1 resize-none"
                  />
                </div>

                {error && <p className="text-red-600 font-medium">{error}</p>}

                <div className="text-center">
                  <button
                    type="submit"
                    className="w-full bg-black rounded text-white py-2"
                  >
                    Submit
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
