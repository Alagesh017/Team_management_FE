import loginLeftImg from "../../assets/login_left.png";

const AuthLayout = ({ children }) => {
  return (
    <div className="h-screen w-full flex bg-white overflow-hidden">
      {/* Left Side: Branding (60% width on Desktop, Full Image) */}
      <div className="hidden lg:block lg:w-[60%] h-full relative overflow-hidden bg-slate-100">
        <img
          src={loginLeftImg}
          alt="DCE Technology"
          className="w-full h-full object-cover"
        />
        {/* Subtle Overlay */}
        <div className="absolute inset-0 bg-black/5 pointer-events-none"></div>
      </div>

      {/* Right Side: Form (40% width on Desktop) */}
      <div className="flex w-full lg:w-[40%] h-full flex-col items-center justify-between bg-white p-4 sm:p-6 relative overflow-y-auto">
        <div className="flex-1 flex items-center justify-center w-full max-w-md my-auto">
          {children}
        </div>
        
        {/* Footer Info */}
        <div className="w-full text-center space-y-1 py-4 mt-auto">
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-[0.2em]">
            @copyright reserved
          </p>
          <p className="text-[10px] text-slate-500 font-medium">
            Designed for <span className="text-slate-900">DCE Technology</span> by <span className="text-slate-900">DCE Technology</span> <span className="text-black inline-block transform transition-transform hover:scale-125 duration-300">🖤</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
