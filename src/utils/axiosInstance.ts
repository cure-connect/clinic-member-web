import axios from 'axios';

let isLoggingOut = false;

const showSessionExpiredModal = () => {
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center z-[9999] animate-fade-in';
  overlay.id = 'session-expired-overlay';

  const modal = document.createElement('div');
  modal.className = 'bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 transform transition-all animate-scale-in border border-white/40';

  
  modal.innerHTML = `
    <div class="text-center">
      <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
        <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">เซสชันหมดอายุ</h3>
      <p class="text-sm text-gray-500 mb-6">เซสชันของคุณหมดอายุแล้ว กรุณาเข้าสู่ระบบใหม่</p>
      <button id="session-expired-btn" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
        เข้าสู่ระบบ
      </button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const style = document.createElement('style');
  style.textContent = `
    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scale-in {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .animate-fade-in {
      animation: fade-in 0.2s ease-out;
    }
    .animate-scale-in {
      animation: scale-in 0.2s ease-out;
    }
  `;
  document.head.appendChild(style);

  document.getElementById('session-expired-btn')?.addEventListener('click', () => {
    window.location.href = '/login';
  });
};

const apiUrl = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: apiUrl,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('clinicToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 && !isLoggingOut) {
      isLoggingOut = true;

      console.error('Access Token Expired or Unauthorized. Forcing Logout.');
      
      localStorage.removeItem('clinicToken'); 
      localStorage.removeItem('clinicUser');

      showSessionExpiredModal();
    }

    return Promise.reject(error);
  }
);

export default api;