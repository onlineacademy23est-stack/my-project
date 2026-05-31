import { useState, useEffect, useRef } from "react";

function App() {
  function App() {
  return (
    <div className="app-container">
      {/* DITO NATIN ILALAGAY ANG NAVBAR */}
      <header className="navbar">
        <div className="counter">0.0000 COINS</div>
        <button className="login-btn">Login</button>
      </header>

      {/* ANG IYONG IBA PANG CONTENT */}
      <main id="center">
        {/* ... hero sections ... */}
      </main>
    </div>
  );
}
  const PATTERN_REFERENCE_1_URL = "https://scontent.fceb2-2.fna.fbcdn.net/v/t39.30808-6/322580276_472651758377824_1051405534381803150_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=rn-G0_m6eOgQ7kNvwH3t_oY&_nc_oc=AdqqkciZ5MFsTk95HtPPCQHIX-D2MH7AOd_WECP1k6XLc9zdSge-6mvtkcWB2wU5x_s&_nc_zt=23&_nc_ht=scontent.fceb2-2.fna&_nc_gid=akv9ZsTfFryRHtfHtheIog&_nc_ss=7b289&oh=00_Af7rpu8VntwBJuFI2yAF_uRsKylz4nBZpZRlWh3W2GF7EQ&oe=6A20C638";
  const PATTERN_REFERENCE_2_URL = "https://i.postimg.cc/vTFGRry2/6744d020-d66f-402f-bac3-0c89b8f24331.jpg";
  
  const OFFICIAL_FB_PAGE_URL = "https://www.facebook.com/onlinelearningacademypage";
  
  const RETURN_TIME = "Monday at 12:00 AM";
   
  const checkIfMaintenanceActive = () => {
    localStorage.removeItem("site_maintenance");
    return false;
  };

  // ✅ ONE TAB POLICY STATE
  const [isDuplicateTab, setIsDuplicateTab] = useState(false);
  const channelRef = useRef(null);

  const [isMaintenance, setIsMaintenance] = useState(checkIfMaintenanceActive);
  const [showLogin, setShowLogin] = useState(false);
  
  const [fbName, setFbName] = useState("");
  const [code, setCode] = useState("");
  const [loggedInCode, setLoggedInCode] = useState(
    localStorage.getItem("lab_code") || ""
  );
  const [loggedInFbName, setLoggedInFbName] = useState(
    localStorage.getItem("fb_name") || ""
  );
  const [screen, setScreen] = useState("home");
  const [showGuide, setShowGuide] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [showEncashModal, setShowEncashModal] = useState(false);
  const [encashStatus, setEncashStatus] = useState({ type: "", msg: "" });
  const [coins, setCoins] = useState(() => {
    const currentCode = localStorage.getItem("lab_code");
    if (currentCode) {
      return Number(parseFloat(localStorage.getItem(`coins_${currentCode}`) || "0").toFixed(4));
    }
    return 0;
  });
  const [questionIndex, setQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [feedbackColor, setFeedbackColor] = useState("");
  const [countdown, setCountdown] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const questions = [
    { "q": "What is the plural form of mouse?", "a": "Mice", "options": ["Mouses", "Mice", "Mices"] },
    { "q": "What is the plural form of goose?", "a": "Geese", "options": ["Gooses", "Geeses", "Geese"] },
    { "q": "What is the plural form of tooth?", "a": "Teeth", "options": ["Teeth", "Tooth", "Teethes"] },
    { "q": "What is the plural form of child?", "a": "Children", "options": ["Childs", "Children", "Childrens"] },
    { "q": "What is the plural form of foot?", "a": "Feet", "options": ["Foots", "Feet", "Feets"] },
    { "q": "What is the plural form of ox?", "a": "Oxen", "options": ["Oxes", "Oxen", "Oxens"] },
    { "q": "What is the plural form of person?", "a": "People", "options": ["People", "Persons", "Peoples"] },
    { "q": "What is the plural form of man?", "a": "Men", "options": ["Mans", "Men", "Mens"] },
    { "q": "What is the plural form of deer?", "a": "Deer", "options": ["Deers", "Deer", "Deeres"] },
    { "q": "What is the plural form of fish?", "a": "Fish", "options": ["Fish", "Fishes", "Fishs"] },
    { "q": "What is the plural form of leaf?", "a": "Leaves", "options": ["Leafs", "Leaves", "Leafes"] },
    { "q": "What is the plural form of cactus?", "a": "Cacti", "options": ["Cactuses", "Cacti", "Cactis"] },
    { "q": "What is the plural form of analysis?", "a": "Analyses", "options": ["Analyses", "Analysises", "Analysis"] },
    { "q": "What is the plural form of axis?", "a": "Axes", "options": ["Axises", "Axes", "Axies"] },
    { "q": "What is the plural form of calf?", "a": "Calves", "options": ["Calfs", "Calves", "Calfes"] },
    { "q": "What is the plural form of focus?", "a": "Foci", "options": ["Focuses", "Foci", "Focusses"] },
    { "q": "What is the plural form of crisis?", "a": "Crises", "options": ["Crises", "Crisises", "Crisis"] },
    { "q": "What is the plural form of sheep?", "a": "Sheep", "options": ["Sheeps", "Sheepes", "Sheep"] },
    { "q": "What is the plural form of thesis?", "a": "Theses", "options": ["Theses", "Thesises", "Thesis"] },
    { "q": "What is the plural form of bacterium?", "a": "Bacteria", "options": ["Bacteriums", "Bacteria", "Bacterias"] },
    { "q": "What is the past tense of teach?", "a": "Taught", "options": ["Teached", "Taught", "Taughten"] },
    { "q": "What is the past tense of catch?", "a": "Caught", "options": ["Catched", "Caught", "Caughted"] },
    { "q": "What is the past tense of drink?", "a": "Drank", "options": ["Drank", "Drunk", "Drinked"] },
    { "q": "What is the past tense of sink?", "a": "Sank", "options": ["Sinked", "Sunken", "Sank"] },
    { "q": "What is the past tense of swim?", "a": "Swam", "options": ["Swam", "Swum", "Swimmed"] },
    { "q": "What is the past tense of bring?", "a": "Brought", "options": ["Bringed", "Brought", "Brang"] },
    { "q": "What is the past tense of begin?", "a": "Began", "options": ["Began", "Begun", "Beginned"] },
    { "q": "What is the past tense of ring?", "a": "Rang", "options": ["Ringed", "Rung", "Rang"] },
    { "q": "What is the past tense of fall?", "a": "Fell", "options": ["Fell", "Fallen", "Felled"] },
    { "q": "What is the past tense of blow?", "a": "Blew", "options": ["Blowed", "Blew", "Blown"] },
    { "q": "What is the past tense of give?", "a": "Gave", "options": ["Gived", "Gave", "Given"] },
    { "q": "What is the past tense of go?", "a": "Went", "options": ["Goed", "Gone", "Went"] },
    { "q": "What is the past tense of know?", "a": "Knew", "options": ["Knew", "Known", "Knowed"] },
    { "q": "What is the past tense of grow?", "a": "Grew", "options": ["Growed", "Grew", "Grown"] },
    { "q": "What is the past tense of break?", "a": "Broke", "options": ["Breaked", "Broke", "Broken"] },
    { "q": "What is the past tense of ride?", "a": "Rode", "options": ["Rode", "Ridden", "Rided"] },
    { "q": "What is the past tense of choose?", "a": "Chose", "options": ["Choosed", "Chosen", "Chose"] },
    { "q": "What is the past tense of hide?", "a": "Hid", "options": ["Hided", "Hid", "Hidden"] },
    { "q": "What is the past tense of write?", "a": "Wrote", "options": ["Writed", "Wrote", "Written"] },
    { "q": "What is the past tense of sleep?", "a": "Slept", "options": ["Slept", "Sleeped", "Sleept"] },
    { "q": "What is the meaning of lazy?", "a": "No willing to work or move", "options": ["Energetic and active", "No willing to work or move", "Always on time"] },
    { "q": "What is the meaning of polite?", "a": "Showing good manners", "options": ["Showing good manners", "Loud and disruptive", "Unfriendly to others"] },
    { "q": "What is the meaning of adventure?", "a": "An exciting journey", "options": ["A boring routine", "An exciting journey", "A safe place to stay"] },
    { "q": "What is the meaning of strong?", "a": "Powerful", "options": ["Weak and fragile", "Powerful", "Scared and nervous"] },
    { "q": "What is the meaning of beautiful?", "a": "Pleasing to look at", "options": ["Pleasing to look at", "Dull and messy", "Hard to find"] },
    { "q": "What is the meaning of dangerous?", "a": "Harmful or risky", "options": ["Safe and protected", "Harmful or risky", "Fun and exciting"] },
    { "q": "What is the meaning of friendly?", "a": "Kind and nice", "options": ["Mean and angry", "Kind and nice", "Quiet and shy"] },
    { "q": "What is the meaning of clever?", "a": "Smart or intelligent", "options": ["Slow to learn", "Smart or intelligent", "Large and heavy"] },
    { "q": "What is the meaning of quick?", "a": "Fast", "options": ["Slow", "Fast", "Heavy"] },
    { "q": "What is the meaning of bright?", "a": "Shiny or intelligent", "options": ["Shiny or intelligent", "Dark and gloomy", "Soft and quiet"] },
    { "q": "What is the text of tiny?", "a": "Very small", "options": ["Very large", "Very small", "Medium-sized"] },
    { "q": "What is the meaning of noisy?", "a": "Making a lot of noise", "options": ["Making a lot of noise", "Silent and calm", "Clean and neat"] },
    { "q": "What is the meaning of happy?", "a": "Feeling joy or pleasure", "options": ["Feeling sad or lonely", "Feeling joy or pleasure", "Feeling tired"] },
    { "q": "What is the meaning of clean?", "a": "Free from dirt", "options": ["Free from dirt", "Dusty and soiled", "Old and broken"] },
    { "q": "What is the meaning of hungry?", "a": "Wanting to eat", "options": ["Wanting to drink", "Wanting to eat", "Wanting to sleep"] },
    { "q": "What is the meaning of fast?", "a": "Moving quickly", "options": ["Moving slowly", "Moving quickly", "Standing still"] },
    { "q": "What is the meaning of soft?", "a": "Smooth and gentle", "options": ["Smooth and gentle", "Hard and rough", "Loud and sharp"] },
    { "q": "What is the meaning of cold?", "a": "Low temperature", "options": ["High temperature", "Low temperature", "Mild weather"] },
    { "q": "What is the meaning of easy?", "a": "Simple", "options": ["Simple", "Difficult", "Complicated"] }
  ];

  // ✅ ONE TAB POLICY useEffect — ILAGAY ITO BAGO ANG IBANG useEffects
  useEffect(() => {
    const CHANNEL_NAME = "ola_single_tab_channel";
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = channel;

    // Mag-announce: "Bukas na ako, mga susunod na tab — sumuko na kayo!"
    channel.postMessage({ type: "TAB_OPENED" });

    channel.onmessage = (event) => {
      if (event.data?.type === "TAB_OPENED") {
        // May bagong tab na nagbukas — ito na yung duplicate, i-block natin ang tab na iyon
        // (pero ito mismo ang original, kaya mag-rereply tayo para malaman ng bago na may nauna na)
        channel.postMessage({ type: "TAB_ALREADY_EXISTS" });
      }
      if (event.data?.type === "TAB_ALREADY_EXISTS") {
        // Natanggap natin ang reply — ibig sabihin, may nauna na! Ito ay duplicate tab.
        setIsDuplicateTab(true);
      }
    };

    return () => {
      channel.close();
    };
  }, []);

  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    const timer = setInterval(() => {
      const currentlyMaintenance = checkIfMaintenanceActive();
      
      if (currentlyMaintenance && !isMaintenance) {
        setIsMaintenance(true);

        if (Notification.permission === "granted") {
          new Notification("Online Learning Academy", {
            body: `⚠️ WEEKEND MAINTENANCE LOCKOUT: The website is now closed. Please return on ${RETURN_TIME}.`,
            icon: "https://cdn-icons-png.flaticon.com/512/564/564619.png"
          });
        }
      } 
      else if (!currentlyMaintenance && isMaintenance) {
        setIsMaintenance(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isMaintenance]);

  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      const nextQuestion = () => {
        setQuestionIndex((prev) => (prev + 1) % questions.length);
        setFeedback("");
        setCountdown(null);
      };
      
      nextQuestion();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, questions.length]);

  const changeScreenWithAnimation = (targetScreen) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setScreen(targetScreen);
      setIsTransitioning(false);
    }, 200);
  };

  function handleStartEarningClick() {
    if (loggedInCode) {
      changeScreenWithAnimation("earn");
    } else {
      setShowLogin(true);
    }
  }

  function handleLogin() {
    if (!fbName.trim()) {
      setEncashStatus({ type: "error", msg: "Please enter your Registered FB Name!" });
      return;
    }
    if (!code) {
      setEncashStatus({ type: "error", msg: "Please enter your LAB Code!" });
      return;
    }
    
    const formattedCode = code.toUpperCase();

    if (formattedCode === "LABADMIN") {
      setEncashStatus({ type: "error", msg: "This code has been deactivated by the administrator!" });
      return;
    }
    
    if (formattedCode === "ADMINCODE") {
      localStorage.setItem("lab_code", "ADMINCODE");
      localStorage.setItem("fb_name", fbName.trim());
      localStorage.setItem("coins_LABMASTER", "500.0000");
      
      setLoggedInCode("LABMASTER");
      setLoggedInFbName(fbName.trim());
      setCoins(500.0000);
      setShowLogin(false);
      changeScreenWithAnimation("earn");
      setCode("");
      setFbName("");
      return;
    }

    if (!formattedCode.startsWith("LAB")) {
      setEncashStatus({ type: "error", msg: "Invalid LAB Code! It must start with 'LAB'." });
      return;
    }
    
    localStorage.setItem("lab_code", formattedCode);
    localStorage.setItem("fb_name", fbName.trim());
    
    setLoggedInCode(formattedCode);
    setLoggedInFbName(fbName.trim());
    const accountCoins = Number(parseFloat(localStorage.getItem(`coins_${formattedCode}`) || "0").toFixed(4));
    setCoins(accountCoins);
    setShowLogin(false);
    changeScreenWithAnimation("earn");
    
    setCode("");
    setFbName("");
  }

  function handleLogout() {
    localStorage.removeItem("lab_code");
    localStorage.removeItem("fb_name");
    setLoggedInCode("");
    setLoggedInFbName("");
    setCode("");
    setFbName("");
    setCoins(0);
    changeScreenWithAnimation("home");
  }

  function answerQuestion(answer) {
    const current = questions[questionIndex];
    if (answer === current.a) {
      const rewardPool = [0.0035, 0.0055, 0.0085];
      const randomArray = new Uint32Array(1);
      window.crypto.getRandomValues(randomArray);
      const randomIndex = randomArray[0] % rewardPool.length;
      
      const randomReward = rewardPool[randomIndex];
      const newCoins = Number((coins + randomReward).toFixed(4));

      setCoins(newCoins);
      localStorage.setItem(`coins_${loggedInCode}`, newCoins);
      setFeedback(`✔ Correct! +${randomReward.toFixed(4)} COINS`);
      setFeedbackColor("text-emerald-400 bg-emerald-500/10 border-emerald-500/30 animate-pulse duration-300");
    } else {
      setFeedback("✖ Wrong Answer");
      setFeedbackColor("text-rose-400 bg-rose-500/10 border-rose-500/30 animate-bounce duration-300");
    }

    setCountdown(15);
  }

  function handleWithdraw(amount) {
    if (coins < amount) {
      setEncashStatus({ type: "error", msg: `❌ Insufficient balance!` });
      return;
    }

    const BACKEND_SERVER_URL = "http://localhost:5000/api/withdraw"; 
    setEncashStatus({ type: "loading", msg: "⏳ Requesting, please wait..." });
    
    fetch(BACKEND_SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        labCode: loggedInCode,
        fbName: loggedInFbName,
        amount: amount
      })
    })
    .then((res) => {
      if (!res.ok) throw new Error("Server error");
      return res.json();
    })
    .then(() => {
      const newBalance = Number((coins - amount).toFixed(4));
      setCoins(newBalance);
      localStorage.setItem(`coins_${loggedInCode}`, newBalance);
 
      setEncashStatus({ type: "success", msg: "✅ Request recorded globally!" });
      setTimeout(() => setShowEncashModal(false), 2000);
    })
    .catch(() => {
      setEncashStatus({ type: "error", msg: "❌ Server error o patay ang backend!" });
    });
  }

  // ✅ ONE TAB POLICY BLOCKER — kung duplicate tab, ipakita ito at wag na i-render ang buong app
  if (isDuplicateTab) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 z-[9999] text-center">
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="relative z-10 max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🚫</span>
          </div>
          
          <h1 className="text-2xl font-black text-white mb-3 tracking-tight">
            Duplicate Tab Detected
          </h1>
          
          <p className="text-slate-400 text-sm leading-relaxed mb-2">
            Ang <span className="text-white font-bold">Online Learning Academy</span> ay isang <span className="text-rose-400 font-bold">one tab only</span> na platform.
          </p>
          <p className="text-slate-500 text-xs leading-relaxed mb-8">
            Para maiwasan ang cheating, isang tab lang ang pinapayagan. Isara ang tab na ito at gamitin ang orihinal na tab.
          </p>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 mb-6">
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-1">No Cheating Policy</p>
            <p className="text-xs text-slate-400">Multiple tabs are strictly prohibited. Violation may result in account suspension.</p>
          </div>

          <button
            onClick={() => window.close()}
            className="w-full bg-rose-600 hover:bg-rose-500 text-white py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95"
          >
            Close This Tab
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200 flex flex-col justify-between antialiased">
      <div className="flex-grow w-full relative flex flex-col">
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[10%] right-[-10%] w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        <header className="relative flex items-center justify-between px-6 sm:px-12 py-5 border-b border-slate-900 backdrop-blur-md bg-slate-950/50 z-40">
          <h1 onClick={() => changeScreenWithAnimation("home")} className="text-xl font-black tracking-tight text-white cursor-pointer select-none transition-all hover:opacity-80 active:scale-95">
            Online Learning <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Academy</span>
          </h1>
          <div className="flex items-center gap-3.5">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 text-slate-200 font-bold px-4 py-2 rounded-xl shadow-inner select-none transition-transform duration-300 hover:scale-105">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="tracking-wide text-xs font-black text-amber-400">
                {loggedInCode ? coins.toFixed(4) : "0.0000"} COINS
              </span>
            </div>
            
            {loggedInCode ? (
              <div className="flex items-center gap-2.5">
                <div className="bg-slate-900/80 text-slate-300 font-bold px-3 py-2 rounded-xl text-xs border border-slate-800/80 flex items-center gap-1.5 backdrop-blur-sm">
                  <span className="opacity-70">👤</span> <span className="tracking-wider text-slate-200">{loggedInFbName}</span>
                </div>
                
                <button onClick={handleLogout} className="bg-slate-900 hover:bg-rose-950/30 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-900/50 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95">
                  Logout
                </button>
              </div>
            ) : (
              <button onClick={() => { setEncashStatus({ type: "", msg: "" }); setShowLogin(true); }} className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/10 active:scale-95">
                Login
              </button>
            )}
          </div>
        </header>

        <main className={`flex-grow flex items-center justify-center p-6 transition-all duration-300 ${isTransitioning ? "opacity-0 scale-95 blur-sm" : "opacity-100 scale-100 blur-none"}`}>
          {screen === "home" && (
            <div className="relative z-10 text-center max-w-2xl mx-auto my-auto py-12 flex flex-col items-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6 animate-pulse">
                ✨ Welcome, {loggedInFbName ? loggedInFbName : "user"}! 
              </div>
              
              <h2 className="text-5xl sm:text-6xl font-black text-white mb-5 tracking-tight leading-tight">
                Learn. Earn. <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Grow.</span>
              </h2>
              
              <p className="text-slate-400 max-w-md mx-auto text-sm sm:text-base mb-10 font-medium leading-relaxed">
                Answer questions by each categories and earn points by reaching the minimum and maximum!
              </p>
              
              <div className="flex flex-col gap-3 w-full max-w-xs">
                <button onClick={handleStartEarningClick} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 py-4 rounded-2xl text-base font-black shadow-xl shadow-orange-500/10 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all">
                  {loggedInCode ? "Start Earning Now" : "Login & Start Learning"}
                </button>
                <button onClick={() => setShowGuide(true)} className="w-full bg-slate-900 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 border border-slate-800 py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-2">
                  <span>📘</span> View Platform Guide & Rules
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-20 border-t border-slate-900 pt-8 w-full max-w-lg mx-auto">
                <div className="text-center group cursor-default">
                  <span className="text-slate-500 text-[11px] font-bold tracking-wider block uppercase mb-1 transition-colors group-hover:text-indigo-400">Quiz Core</span>
                  <span className="text-sm font-semibold text-slate-300">Automated</span>
                </div>
                <div className="text-center border-x border-slate-900 group cursor-default">
                  <span className="text-slate-500 text-[11px] font-bold tracking-wider block uppercase mb-1 transition-colors group-hover:text-amber-400">Rewards</span>
                  <span className="text-sm font-semibold text-slate-300">Real-time</span>
                </div>
                <div className="text-center group cursor-default">
                  <span className="text-slate-500 text-[11px] font-bold tracking-wider block uppercase mb-1 transition-colors group-hover:text-pink-400">Withdraw</span>
                  <span className="text-sm font-semibold text-slate-300">Instant</span>
                </div>
              </div>
            </div>
          )}

          {screen === "earn" && (
            <div className="max-w-md w-full mx-auto relative z-10 my-auto">
              <div className="bg-slate-900/40 border border-slate-800/80 p-8 sm:p-10 rounded-3xl shadow-2xl backdrop-blur-md">
                <div className="flex justify-between items-center mb-8">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Active Task</span>
                  <span className="text-xs font-black px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Q: {questionIndex + 1}/{questions.length}
                  </span>
                </div>

                <p className="mb-8 text-2xl font-black text-white tracking-tight">{questions[questionIndex].q}</p>
                
                <div className="grid gap-3">
                  {questions[questionIndex].options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => answerQuestion(option)}
                      disabled={countdown !== null}
                      className={`w-full text-left px-5 bg-slate-900/60 border border-slate-800/80 py-4 rounded-xl font-bold text-sm transition-all transform text-slate-300 ${
                        countdown !== null
                          ? "opacity-30 cursor-not-allowed scale-[0.98] blur-[0.5px]"
                          : "hover:bg-slate-800/50 hover:border-slate-700/80 active:scale-[0.99] hover:text-white hover:-translate-y-0.5"
                      }`}
                    >
                      <span className="inline-block w-6 text-slate-600 font-mono text-xs">{String.fromCharCode(65 + idx)}.</span>
                      {option}
                    </button>
                  ))}
                </div>

                {feedback && (
                  <div className={`mt-5 p-3.5 rounded-xl text-center text-xs font-bold border transition-all duration-300 ${feedbackColor}`}>
                    {feedback}
                  </div>
                )}

                {countdown !== null && (
                  <div className="mt-3 flex items-center justify-center gap-2 text-slate-400 text-xs font-semibold animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                    Next question in <span className="text-amber-400 font-black text-sm">{countdown}s</span>
                  </div>
                )}

                <div className="my-6 border-t border-slate-800/60"></div>
                
                <div className="flex flex-col gap-2">
                  <button onClick={() => { setEncashStatus({ type: "", msg: "" }); setShowEncashModal(true); }} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 border border-slate-700/50">
                    <span>💼</span> Encashment Options
                  </button>
                  <button onClick={() => setShowGuide(true)} className="w-full bg-slate-900/50 hover:bg-slate-900 text-slate-400 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95 flex items-center justify-center gap-1.5 border border-slate-800/40">
                    <span>📘</span> View Answer Keys & Rules
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <footer className="w-full text-center pb-6 pt-2 z-30">
        <a 
          href={OFFICIAL_FB_PAGE_URL} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="inline-flex items-center gap-1.5 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 text-xs font-bold transition-all hover:scale-105 mb-2"
        >
          <span></span>OFFICIAL PAGE
        </a>
        <p className="text-slate-400 text-[10px] font-bold tracking-widest uppercase">Developed by ADMIN</p>
      </footer>

      {/* LOGIN MODAL */}
      {showLogin && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all duration-300">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-sm text-slate-100 shadow-2xl relative transition-transform transform scale-100 animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setShowLogin(false)} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 text-xs font-bold transition-colors">✕</button>
            <h2 className="text-xl font-black mb-2 text-white tracking-tight">Login Portal</h2>
            <p className="text-xs text-slate-500 mb-5 font-medium">Please enter your Registered FB name and LAB Code assigned to you.</p>
            
            <input 
              type="text"
              value={fbName} 
              onChange={(e) => setFbName(e.target.value)} 
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:border-indigo-500 focus:outline-none text-center font-bold mb-3 text-sm transition-all" 
              placeholder="Registered FB Name" 
            />

            <input 
              type="text"
              value={code} 
              onChange={(e) => setCode(e.target.value)} 
              className="w-full px-4 py-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:border-indigo-500 focus:outline-none text-center font-black mb-4 tracking-widest text-base uppercase transition-all" 
              placeholder="E.g., LAB123" 
              onKeyDown={(e) => e.key === "Enter" && handleLogin()} 
            />

            {encashStatus.type === "error" && (
              <p className="text-xs text-rose-400 font-semibold mb-4 text-center animate-shake">{encashStatus.msg}</p>
            )}

            <button onClick={handleLogin} className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-indigo-600/10">
              Confirm & Authenticate
            </button>
          </div>
        </div>
      )}

      {/* GUIDE MODAL */}
      {showGuide && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl w-full max-w-lg text-slate-100 shadow-2xl my-8 transition-all transform scale-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>📘</span> Academy Guide & Rules
              </h2>
              <button onClick={() => setShowGuide(false)} className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all">
                Close
              </button>
            </div>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar text-left">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-amber-400 mb-2">1. Rules & Regulations</h3>
                <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4 leading-relaxed">
                  <li>NO SPAMMING, NO CHANGING OF FB NAMES, NO CHEATING!</li>
                  <li>Respect our CEO/ADMINS/MEMBERS</li>
                  <li>Our system is open every weekdays(Mon-Fri) and our maintenance is every friday starts at 11:50PM until sunday 11:59PM.</li>
                  <li>For more concerns, please contact your upline or admin.</li>
                  <li>Note: Refrain from spamming, our developer is observing.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-3">2. System Answer Keys Reference</h3>
                <p className="text-[11px] text-slate-500 mb-3">CHECK YOUR ANSWER KEY BELOW. (I-click para palakihin):</p>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex flex-col items-center group">
                    <div 
                      className="w-full h-32 bg-slate-900 rounded-lg border border-slate-800/60 flex flex-col items-center justify-center mb-2 text-slate-600 relative overflow-hidden cursor-pointer"
                      onClick={() => setPreviewImage(PATTERN_REFERENCE_1_URL)}
                    >
                      {PATTERN_REFERENCE_1_URL ? (
                        <img src={PATTERN_REFERENCE_1_URL} alt="Ref 1" referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full bg-slate-950 flex items-center justify-center font-bold text-xs text-slate-700">Image Ref 1</div>
                      )}
                      <span className="absolute bottom-1 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400"></span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-300 transition-colors group-hover:text-indigo-400 text-center block">Answer key</span>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex flex-col items-center group">
                    <div 
                      className="w-full h-32 bg-slate-900 rounded-lg border border-slate-800/60 flex flex-col items-center justify-center mb-2 text-slate-600 relative overflow-hidden cursor-pointer"
                      onClick={() => setPreviewImage(PATTERN_REFERENCE_2_URL)}
                    >
                      {PATTERN_REFERENCE_2_URL ? (
                        <img src={PATTERN_REFERENCE_2_URL} alt="Ref 2" referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full bg-slate-950 flex items-center justify-center font-bold text-xs text-slate-700">Image Ref 2</div>
                      )}
                      <span className="absolute bottom-1 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400"></span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-300 transition-colors group-hover:text-indigo-400 text-center block">DTI Registered</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-800 pt-4">
              <button onClick={() => setShowGuide(false)} className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white py-3 rounded-xl font-bold text-xs transition-all active:scale-95">
                I Understood the Rules
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ENCASHMENT MODAL */}
      {showEncashModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-md text-slate-100 text-center shadow-2xl transition-all transform scale-100 animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Bot Encashment Setup</h2>
            <p className="text-xs text-slate-500 mb-6 font-medium">Select your desired voucher withdrawal tier from the system database.</p>
    
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button onClick={() => handleWithdraw(10)} className="bg-slate-950/60 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl transition-all transform active:scale-95 group text-center hover:-translate-y-0.5">
                <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider mb-1 group-hover:text-amber-400 transition-colors">Minimum Tier</span>
                <span className="text-2xl font-black text-slate-200 font-mono transition-colors group-hover:text-white">$10.00</span>
              </button>
              <button onClick={() => handleWithdraw(15)} className="bg-slate-950/60 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl transition-all transform active:scale-95 group text-center hover:-translate-y-0.5">
                <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider mb-1 group-hover:text-amber-400 transition-colors">Maximum Tier</span>
                <span className="text-2xl font-black text-slate-200 font-mono transition-colors group-hover:text-white">$15.00</span>
              </button>
            </div>

            {encashStatus.msg && (
              <div className={`mb-5 p-3 rounded-xl text-xs font-semibold border transition-all duration-300 ${
                encashStatus.type === "success" 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                  : encashStatus.type === "loading"
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    : "bg-rose-500/10 border-rose-500/20 text-rose-400"
              }`}>
                {encashStatus.msg}
              </div>
            )}

            <button onClick={() => { setShowEncashModal(false); setEncashStatus({ type: "", msg: "" }); }} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl text-xs font-bold transition-all border border-slate-700/40">
              Close Window
            </button>
          </div>
        </div>
      )}

      {/* FULLSCREEN PICTURE PREVIEW MODAL */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center p-4 z-[60] transition-opacity duration-300"
          onClick={() => setPreviewImage(null)}
        >
          <button 
            onClick={() => setPreviewImage(null)}
            className="absolute top-6 right-6 bg-slate-900/80 hover:bg-slate-800 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border border-slate-800 transition-all active:scale-95 shadow-lg"
          >
            ✕
          </button>
          
          <div className="max-w-4xl max-h-[85vh] flex items-center justify-center select-none" onClick={(e) => e.stopPropagation()}>
            <img 
              src={previewImage} 
              alt="Fullscreen Preview" 
              referrerPolicy="no-referrer"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain border border-slate-900 shadow-2xl transition-transform duration-300 transform scale-100"
            />
          </div>
          
          <p className="text-slate-500 text-xs mt-4 font-medium select-none">I-click kahit saan para isara ang preview</p>
        </div>
      )}

    </div>
  );
}

export default App;