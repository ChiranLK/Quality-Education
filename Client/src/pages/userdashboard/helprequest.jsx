import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import customFetch from "../../utils/customfetch";
import HelpRequestVideo from "../../components/HelpRequestVideo";
import SubmittedMessagesModal from "./components/SubmittedMessagesModal";

// Component imports
import HelpRequestHeader from "./components/HelpRequestHeader";
import SuccessBanner from "./components/SuccessBanner";
import HelpRequestTips from "./components/HelpRequestTips";
import HelpRequestForm from "./components/HelpRequestForm";

// Constants import
import {
  INITIAL_FORM,
  CATEGORIES,
} from "./components/helpRequestConstants";

export default function HelpRequest({ user }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [formUILanguage, setFormUILanguage] = useState("English");
  const [editingMessage, setEditingMessage] = useState(null);

  // Populate form when editing a message
  useEffect(() => {
    if (editingMessage) {
      setForm({
        title: editingMessage.title || "",
        message: editingMessage.message || "",
        category: editingMessage.category || "",
        language: editingMessage.language || "",
      });
      // Scroll to form
      setTimeout(() => {
        const formElement = document.querySelector('form');
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [editingMessage]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required.";
    else if (form.title.length < 5) e.title = "Title must be at least 5 characters.";
    if (!form.message.trim()) e.message = "Message is required.";
    else if (form.message.length < 20) e.message = "Please describe your issue in at least 20 characters.";
    if (!form.category) e.category = "Please select a category.";
    if (!form.language) e.language = "Please select a language.";
    return e;
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleLanguageChange = (language) => {
    setFormUILanguage(language);
  };

  const handleEditMessage = (message) => {
    setEditingMessage(message);
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setForm(INITIAL_FORM);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the errors before submitting.");
      return;
    }

    setLoading(true);
    try {
      if (editingMessage) {
        // Update existing message
        await customFetch.patch(`/messages/${editingMessage._id}`, {
          title: form.title.trim(),
          message: form.message.trim(),
          category: form.category,
          language: form.language,
        });

        toast.success("Your message has been updated! 📝");
        setEditingMessage(null);
      } else {
        // Create new message
        await customFetch.post("/messages", {
          title: form.title.trim(),
          message: form.message.trim(),
          category: form.category,
          language: form.language,
          formUILanguage, // Send the form UI language for translation
        });

        toast.success("Your request has been published to all tutors! 🎉");
      }

      setForm(INITIAL_FORM);
      setErrors({});
      setSubmitted(true);
      setRefreshTrigger((prev) => prev + 1); // Trigger modal refresh
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      const msg = err?.response?.data?.msg || "Failed to submit. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <Toaster
        position="top-right"
        toastOptions={{ style: { borderRadius: "12px", fontSize: "14px" } }}
      />

      {/* Header Section */}
      <HelpRequestHeader onViewSubmissions={() => setShowMessagesModal(true)} />

      {/* Success Banner */}
      <SuccessBanner isVisible={submitted} onClose={() => setSubmitted(false)} />

      {/* Video Section */}
      <HelpRequestVideo />

      {/* Tips Section */}
      <HelpRequestTips />

      {/* Form Section */}
      <HelpRequestForm
        form={form}
        errors={errors}
        loading={loading}
        onFormChange={handleFormChange}
        onLanguageChange={handleLanguageChange}
        onSubmit={handleSubmit}
        isEditMode={!!editingMessage}
        editingMessage={editingMessage}
        onCancelEdit={handleCancelEdit}
      />

      {/* Submitted Messages Modal */}
      <SubmittedMessagesModal
        isOpen={showMessagesModal}
        onClose={() => setShowMessagesModal(false)}
        triggerRefresh={refreshTrigger}
        onEdit={handleEditMessage}
      />
    </div>
  );
}
