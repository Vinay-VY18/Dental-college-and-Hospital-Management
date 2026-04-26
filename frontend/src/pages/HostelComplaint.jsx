import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Home } from 'lucide-react';
import axios from 'axios';

export const HostelComplaint = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [success, setSuccess] = useState(false);

  const onSubmit = async (data) => {
    try {
      const res = await axios.post('http://localhost:5000/api/hostel/complaints', data);
      if (res.data.success) {
        setSuccess(true);
        reset();
      }
    } catch (error) {
      console.error(error);
      alert('Failed to submit complaint');
    }
  };

  return (
    <div className="min-h-screen bg-brand-light py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-end mb-6 border-b-2 border-brand-teal pb-4">
          <h1 className="text-3xl font-bold text-brand-blue flex items-center">
            <Home className="mr-3 h-8 w-8 text-brand-teal" /> Hostel Utilities
          </h1>
          
          
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-6">Register a New Complaint</h2>
          
          {success && (
            <div className="mb-6 bg-green-50 text-green-700 p-4 rounded border border-green-200">
              Complaint registered successfully! The warden has been notified.
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                <input type="text" {...register("name", { required: "Required" })} className={`w-full px-4 py-2 border rounded-md focus:ring-brand-teal outline-none ${errors.name ? 'border-red-500' : 'border-gray-300'}`} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                <input type="text" {...register("room", { required: "Required" })} className={`w-full px-4 py-2 border rounded-md focus:ring-brand-teal outline-none ${errors.room ? 'border-red-500' : 'border-gray-300'}`} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Complaint Category</label>
              <select {...register("category", { required: "Required" })} className={`w-full px-4 py-2 border rounded-md focus:ring-brand-teal outline-none bg-white ${errors.category ? 'border-red-500' : 'border-gray-300'}`}>
                <option value="">Select an option</option>
                <option value="electrical">Electrical Issue</option>
                <option value="plumbing">Plumbing/Water Issue</option>
                <option value="cleanliness">Cleanliness</option>
                <option value="internet">Internet/WiFi</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea rows="4" {...register("description", { required: "Please describe the issue" })} className={`w-full px-4 py-2 border rounded-md focus:ring-brand-teal outline-none ${errors.description ? 'border-red-500' : 'border-gray-300'}`}></textarea>
            </div>

            <button type="submit" className="bg-brand-teal text-white px-6 py-2 rounded-md font-medium hover:bg-opacity-90">
              Submit Complaint
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
