// import { useState } from 'react';
// import { X } from 'lucide-react';

// interface BookingCalendarProps {
//   propertyTitle: string;
//   onClose: () => void;
//   onBookingConfirmed?: (bookingDetails: BookingDetails) => void;
// }

// export interface BookingDetails {
//   date: Date;
//   time: string;
//   name: string;
//   email: string;
//   phone: string;
// }

// export function BookingCalendar({ propertyTitle, onClose, onBookingConfirmed }: BookingCalendarProps) {
//   const [selectedDate, setSelectedDate] = useState<Date | null>(null);
//   const [selectedTime, setSelectedTime] = useState<string | null>(null);
//   const [step, setStep] = useState(1); // 1 for date selection, 2 for time selection, 3 for confirmation
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [phone, setPhone] = useState('');

//   // Generate dates for the next 30 days
//   const dates = [];
//   const currentDate = new Date();
//   for (let i = 0; i < 30; i++) {
//     const date = new Date();
//     date.setDate(currentDate.getDate() + i);
//     dates.push(date);
//   }

//   // Available time slots
//   const timeSlots = [
//     '9:00 AM', '10:00 AM', '11:00 AM', 
//     '12:00 PM', '1:00 PM', '2:00 PM', 
//     '3:00 PM', '4:00 PM', '5:00 PM'
//   ];

//   const handleDateClick = (date: Date) => {
//     setSelectedDate(date);
//     setStep(2);
//   };

//   const handleTimeClick = (time: string) => {
//     setSelectedTime(time);
//     setStep(3);
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (selectedDate && selectedTime) {
//       const bookingDetails: BookingDetails = {
//         date: selectedDate,
//         time: selectedTime,
//         name,
//         email,
//         phone
//       };

//       // Call the callback if provided
//       if (onBookingConfirmed) {
//         onBookingConfirmed(bookingDetails);
//       } else {
//         // Default confirmation
//         alert(`Booking confirmed for ${selectedDate.toLocaleDateString()} at ${selectedTime}`);
//       }

//       onClose();
//     }
//   };

//   const formatDate = (date: Date) => {
//     return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
//   };

//   return (
//     <div className="bg-white w-full max-w-xl rounded-lg shadow-xl flex flex-col max-h-[90vh]">
//       <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-t-lg">
//         <h2 className="text-lg font-semibold">Book a Visit - {propertyTitle}</h2>
//         <button
//           onClick={onClose}
//           className="p-2 hover:bg-blue-600 rounded-full transition-colors"
//           aria-label="Close calendar"
//         >
//           <X className="w-5 h-5" />
//         </button>
//       </div>

//       <div className="p-4 overflow-auto">
//         {step === 1 && (
//           <div>
//             <h3 className="text-lg font-medium mb-4">Select a Date</h3>
//             <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
//               {dates.map((date, index) => (
//                 <button
//                   key={index}
//                   onClick={() => handleDateClick(date)}
//                   className={`p-3 border rounded-lg text-center hover:bg-blue-50 transition-colors ${
//                     date.getDay() === 0 || date.getDay() === 6 ? 'bg-gray-100' : ''
//                   }`}
//                 >
//                   <div className="font-medium">{formatDate(date)}</div>
//                 </button>
//               ))}
//             </div>
//           </div>
//         )}

//         {step === 2 && selectedDate && (
//           <div>
//             <button 
//               onClick={() => setStep(1)} 
//               className="mb-4 text-blue-500 flex items-center"
//             >
//               <span className="mr-1">←</span> Back to dates
//             </button>
//             <h3 className="text-lg font-medium mb-2">
//               Select a Time for {formatDate(selectedDate)}
//             </h3>
//             <div className="grid grid-cols-3 gap-2">
//               {timeSlots.map((time, index) => (
//                 <button
//                   key={index}
//                   onClick={() => handleTimeClick(time)}
//                   className="p-3 border rounded-lg text-center hover:bg-blue-50 transition-colors"
//                 >
//                   {time}
//                 </button>
//               ))}
//             </div>
//           </div>
//         )}

//         {step === 3 && selectedDate && selectedTime && (
//           <div>
//             <button 
//               onClick={() => setStep(2)} 
//               className="mb-4 text-blue-500 flex items-center"
//             >
//               <span className="mr-1">←</span> Back to times
//             </button>
//             <h3 className="text-lg font-medium mb-4">
//               Complete your booking for {formatDate(selectedDate)} at {selectedTime}
//             </h3>
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div>
//                 <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
//                   Full Name
//                 </label>
//                 <input
//                   type="text"
//                   id="name"
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   className="w-full p-2 border rounded-md"
//                   required
//                 />
//               </div>
//               <div>
//                 <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
//                   Email
//                 </label>
//                 <input
//                   type="email"
//                   id="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="w-full p-2 border rounded-md"
//                   required
//                 />
//               </div>
//               <div>
//                 <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
//                   Phone Number
//                 </label>
//                 <input
//                   type="tel"
//                   id="phone"
//                   value={phone}
//                   onChange={(e) => setPhone(e.target.value)}
//                   className="w-full p-2 border rounded-md"
//                   required
//                 />
//               </div>
//               <button
//                 type="submit"
//                 className="w-full p-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-md hover:from-cyan-500 hover:to-blue-600 transition-colors"
//               >
//                 Confirm Booking
//               </button>
//             </form>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar, Clock, User, Mail, Phone, Check } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { Profile, ProfileService } from '../../lib/profileService';

interface BookingCalendarProps {
    propertyTitle: string;
    onClose: () => void;
    onBookingConfirmed?: (bookingDetails: BookingDetails) => void;
}

export interface BookingDetails {
    date: Date;
    time: string;
    name: string;
    email: string;
    phone: string;
}

export function BookingCalendar({ propertyTitle, onClose, onBookingConfirmed }: BookingCalendarProps) {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [step, setStep] = useState(1); // 1 for date selection, 2 for time selection, 3 for confirmation
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const { user } = useAuthStore();
    const [profile, setProfile] = useState<Profile | null>(null);


    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                if (user?.id) {
                    const profileData = await ProfileService.getProfile(user.id);
                    setProfile(profileData);
                }
            } catch (error) {
                toast.error("Failed to load profile");
            }
        };

        fetchProfileData();
    }, [user]);


    const [currentMonthStart, setCurrentMonthStart] = useState<Date>(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });

    // Navigation functions for month view
    const goToPreviousMonth = () => {
        setCurrentMonthStart(new Date(currentMonthStart.getFullYear(), currentMonthStart.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentMonthStart(new Date(currentMonthStart.getFullYear(), currentMonthStart.getMonth() + 1, 1));
    };

    // Generate calendar days for the current month view
    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const generateCalendarDays = () => {
        const year = currentMonthStart.getFullYear();
        const month = currentMonthStart.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDayOfMonth = getFirstDayOfMonth(year, month);

        const days = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(null);
        }

        // Add cells for each day of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    };

    const calendarDays = generateCalendarDays();

    // Available time slots
    const morningSlots = ['9:00 AM', '10:00 AM', '11:00 AM'];
    const afternoonSlots = ['12:00 PM', '1:00 PM', '2:00 PM'];
    const eveningSlots = ['3:00 PM', '4:00 PM', '5:00 PM'];

    const handleDateClick = (date: Date) => {
        // Only allow selecting current or future dates
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (date >= today) {
            setSelectedDate(date);
            setStep(2);
        }
    };

    const handleTimeClick = (time: string) => {
        setSelectedTime(time);
        setStep(3);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedDate && selectedTime) {
            const bookingDetails: BookingDetails = {
                date: selectedDate,
                time: selectedTime,
                name,
                email,
                phone
            };

            // Call the callback if provided
            if (onBookingConfirmed) {
                onBookingConfirmed(bookingDetails);
            } else {
                // Default confirmation
                alert(`Booking confirmed for ${selectedDate.toLocaleDateString()} at ${selectedTime}`);
            }

            onClose();
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const formatMonth = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const isPastDate = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    // Day names for calendar header
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="bg-white w-full max-w-xl rounded-lg shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-t-lg">
                <h2 className="text-lg font-semibold">Book a Visit - {propertyTitle}</h2>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-blue-600 rounded-full transition-colors"
                    aria-label="Close calendar"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Progress indicator */}
            <div className="px-6 pt-4">
                <div className="flex items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                        <Calendar className="w-4 h-4" />
                    </div>
                    <div className={`flex-1 h-1 ${step >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                        <Clock className="w-4 h-4" />
                    </div>
                    <div className={`flex-1 h-1 ${step >= 3 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                        <User className="w-4 h-4" />
                    </div>
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span className="ml-1">Select Date</span>
                    <span className="ml-3">Choose Time</span>
                    <span>Your Details</span>
                </div>
            </div>

            <div className="p-4 overflow-auto">
                {step === 1 && (
                    <div className="animate-fadeIn">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">Select a Date</h3>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={goToPreviousMonth}
                                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                                    aria-label="Previous month"
                                >
                                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                                </button>
                                <span className="text-sm font-medium">
                                    {formatMonth(currentMonthStart)}
                                </span>
                                <button
                                    onClick={goToNextMonth}
                                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                                    aria-label="Next month"
                                >
                                    <ChevronRight className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {dayNames.map((day, index) => (
                                    <div key={index} className="text-center text-gray-500 text-xs font-medium py-1">
                                        {day}
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                                {calendarDays.map((date, index) => (
                                    <div key={index} className="aspect-square p-1">
                                        {date ? (
                                            <button
                                                onClick={() => handleDateClick(date)}
                                                disabled={isPastDate(date)}
                                                className={`w-full h-full flex items-center justify-center rounded-full text-sm transition-colors
                          ${selectedDate && date.getTime() === selectedDate.getTime() ? 'bg-blue-500 text-white' : ''}
                          ${isToday(date) ? 'border border-blue-500' : ''}
                          ${isPastDate(date) ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-blue-100'}`}
                                            >
                                                {date.getDate()}
                                            </button>
                                        ) : (
                                            <div className="w-full h-full"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && selectedDate && (
                    <div className="animate-fadeIn">
                        <div className="flex items-center mb-4">
                            <button
                                onClick={() => setStep(1)}
                                className="mr-3 text-blue-500 hover:text-blue-600 flex items-center"
                                aria-label="Back to dates"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <h3 className="text-lg font-medium">
                                Select a Time for {formatDate(selectedDate)}
                            </h3>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                                    <span className="inline-block w-1 h-4 bg-yellow-400 mr-2"></span>
                                    Morning
                                </h4>
                                <div className="grid grid-cols-3 gap-2">
                                    {morningSlots.map((time, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleTimeClick(time)}
                                            className={`p-3 border rounded-lg text-center transition-all hover:shadow-md
                        ${selectedTime === time ? 'border-blue-500 bg-blue-50 text-blue-700' : 'hover:border-blue-200 hover:bg-blue-50'}`}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                                    <span className="inline-block w-1 h-4 bg-orange-400 mr-2"></span>
                                    Afternoon
                                </h4>
                                <div className="grid grid-cols-3 gap-2">
                                    {afternoonSlots.map((time, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleTimeClick(time)}
                                            className={`p-3 border rounded-lg text-center transition-all hover:shadow-md
                        ${selectedTime === time ? 'border-blue-500 bg-blue-50 text-blue-700' : 'hover:border-blue-200 hover:bg-blue-50'}`}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                                    <span className="inline-block w-1 h-4 bg-blue-400 mr-2"></span>
                                    Evening
                                </h4>
                                <div className="grid grid-cols-3 gap-2">
                                    {eveningSlots.map((time, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleTimeClick(time)}
                                            className={`p-3 border rounded-lg text-center transition-all hover:shadow-md
                        ${selectedTime === time ? 'border-blue-500 bg-blue-50 text-blue-700' : 'hover:border-blue-200 hover:bg-blue-50'}`}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && selectedDate && selectedTime && (
                    <div className="animate-fadeIn">
                        <div className="flex items-center mb-6">
                            <button
                                onClick={() => setStep(2)}
                                className="mr-3 text-blue-500 hover:text-blue-600 flex items-center"
                                aria-label="Back to times"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <h3 className="text-lg font-medium">
                                Complete Your Booking
                            </h3>
                        </div>

                        <div className="bg-blue-50 p-2 rounded-lg mb-6 flex items-center">
                            <div className="flex-shrink-0 bg-blue-100 p-2 rounded-lg mr-3">
                                <Calendar className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="font-medium text-blue-800">Your appointment</p>
                                <p className="text-sm text-blue-600">{formatDate(selectedDate)} at {selectedTime}</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <p className='font-medium text-blue-500 text-center'>Confirm Contact Detail</p>
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                    <User className="w-4 h-4 mr-2" /> Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={name || profile?.full_name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                    <Mail className="w-4 h-4 mr-2" /> Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email || profile?.email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="john@example.com"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                    <Phone className="w-4 h-4 mr-2" /> Phone Number
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    value={phone || profile?.phone_number}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="+1 (555) 123-4567"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full p-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-lg hover:from-cyan-500 hover:to-blue-600 transition-colors flex items-center justify-center font-medium"
                            >
                                <Check className="w-5 h-5 mr-2" /> Confirm Booking
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}