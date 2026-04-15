import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

const Feedback = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();
  const [successMessage, setSuccessMessage] = useState(false);

  const onSubmit = async (data) => {
    // Simulate API Call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("Feedback data submitted:", data);
    setSuccessMessage(true);
    reset();
    
    setTimeout(() => {
      setSuccessMessage(false);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-brand-light py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-brand-blue py-6 px-8 text-white">
            <h1 className="text-2xl font-bold">{t.FEEDBACK_SUGGESTIONS}</h1>
            <p className="text-brand-light opacity-80 mt-1">{t.FEEDBACK_SUB}</p>
          </div>
          
          <div className="p-8">
            {successMessage ? (
              <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-8 text-center flex flex-col items-center">
                <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{t.THANK_YOU}</h3>
                <p>{t.FEEDBACK_SUCCESS}</p>
                <button 
                  onClick={() => setSuccessMessage(false)}
                  className="mt-6 px-4 py-2 border border-green-400 text-green-700 rounded-md hover:bg-green-100 transition-colors"
                >
                  {t.SUBMIT_ANOTHER}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    {t.FULL_NAME}
                  </label>
                  <input
                    id="name"
                    type="text"
                    {...register("name", { required: t.NAME_REQUIRED })}
                    className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-brand-teal focus:border-transparent outline-none transition-all ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="John Doe"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    {t.EMAIL_ADDRESS}
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...register("email", { 
                      required: t.EMAIL_REQUIRED,
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: t.INVALID_EMAIL
                      }
                    })}
                    className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-brand-teal focus:border-transparent outline-none transition-all ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="john@example.com"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    {t.FEEDBACK_CATEGORY}
                  </label>
                  <select
                    id="type"
                    {...register("type", { required: t.CATEGORY_REQUIRED })}
                    className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-brand-teal focus:border-transparent outline-none bg-white transition-all ${errors.type ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">{t.SELECT_CATEGORY}</option>
                    <option value="hospital">{t.CATEGORY_HOSPITAL}</option>
                    <option value="academic">{t.CATEGORY_ACADEMIC}</option>
                    <option value="hostel">{t.CATEGORY_HOSTEL}</option>
                    <option value="other">{t.CATEGORY_OTHER}</option>
                  </select>
                  {errors.type && <p className="mt-1 text-sm text-red-500">{errors.type.message}</p>}
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    {t.YOUR_MESSAGE}
                  </label>
                  <textarea
                    id="message"
                    rows="5"
                    {...register("message", { 
                      required: t.MESSAGE_EMPTY,
                      minLength: { value: 20, message: t.MESSAGE_MIN }
                    })}
                    className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-brand-teal focus:border-transparent outline-none resize-none transition-all ${errors.message ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder={t.MESSAGE_PLACEHOLDER}
                  ></textarea>
                  {errors.message && <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-brand-teal text-white py-3 rounded-md font-semibold hover:bg-opacity-90 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t.SUBMITTING}
                      </span>
                    ) : (
                      t.SUBMIT_FEEDBACK
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
