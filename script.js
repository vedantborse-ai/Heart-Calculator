document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const heartBgContainer = document.getElementById('heart-bg');
    const loveForm = document.getElementById('love-form');
    const inputCard = document.getElementById('input-card');
    const resultCard = document.getElementById('result-card');
    const btnBack = document.getElementById('btn-back');
    
    const name1Input = document.getElementById('name1');
    const name2Input = document.getElementById('name2');
    const scorePercentage = document.getElementById('score-percentage');
    const scoreCircle = document.querySelector('.score-circle');
    const resultStatus = document.getElementById('result-status');
    const resultDescription = document.getElementById('result-description');

    // 1. Spawning floating background hearts
    const heartIcons = ['fa-heart', 'fa-heart-broken', 'fa-heart-pulse', 'fa-heart-circle-bolt'];
    
    function createFloatingHeart() {
        const heart = document.createElement('i');
        const randomIcon = heartIcons[Math.floor(Math.random() * heartIcons.length)];
        
        heart.classList.add('fa-solid', randomIcon, 'floating-heart');
        
        // Random positioning and styling
        const startLeft = Math.random() * 100; // random horizontal starting position (0-100vw)
        const size = Math.random() * 1.5 + 0.8; // size from 0.8rem to 2.3rem
        const duration = Math.random() * 6 + 6; // speed from 6s to 12s
        const delay = Math.random() * 3; // delay up to 3s
        
        heart.style.left = `${startLeft}vw`;
        heart.style.fontSize = `${size}rem`;
        heart.style.animationDuration = `${duration}s`;
        heart.style.animationDelay = `${delay}s`;
        
        // Slight opacity variation
        heart.style.opacity = Math.random() * 0.4 + 0.1;
        
        heartBgContainer.appendChild(heart);
        
        // Remove heart after animation finishes
        setTimeout(() => {
            heart.remove();
        }, (duration + delay) * 1000);
    }

    // Spawn initial hearts and then spawn periodically
    for (let i = 0; i < 15; i++) {
        createFloatingHeart();
    }
    setInterval(createFloatingHeart, 800);

    // 2. Calculation Logic
    function getCompatibilityScore(n1, n2) {
        // Normalize names
        const name1 = n1.trim().toLowerCase();
        const name2 = n2.trim().toLowerCase();
        
        if (!name1 || !name2) return 0;
        
        // A simple but deterministic algorithm so same names always get the same score
        let sum = 0;
        const combined = name1 + name2;
        
        for (let i = 0; i < combined.length; i++) {
            sum += combined.charCodeAt(i);
        }
        
        // Generate a score between 30 and 100 (for general positivity, but maintaining diversity)
        let score = (sum % 71) + 30;
        
        // Special Easter Eggs if user types identical names or funny entries
        if (name1 === name2) {
            score = 100;
        }
        
        return score;
    }

    function getLoveForecast(score) {
        if (score >= 90) {
            return {
                status: "Cosmic Soulmates! 💖",
                desc: "Your stars are aligned! This connection is written in the heavens. You share an unbreakable bond that transcends the ordinary."
            };
        } else if (score >= 75) {
            return {
                status: "Burning Passion! 🔥",
                desc: "The chemistry between you two is electric! You share incredible compatibility, deep understanding, and mutual attraction."
            };
        } else if (score >= 50) {
            return {
                status: "Warm Connection! ✨",
                desc: "A beautiful, promising connection. There is plenty of warmth and mutual respect here. With care, this spark can grow into a roaring fire!"
            };
        } else if (score >= 35) {
            return {
                status: "Flickering Spark! 🌱",
                desc: "There is some interest, but both of you need to work a bit more on finding common grounds. Keep communicating!"
            };
        } else {
            return {
                status: "Platonic Vibes! 🤝",
                desc: "Perhaps you are destined to be great friends or partners in crime. Don't worry, the best connections sometimes start from friendship!"
            };
        }
    }

    // 3. Card Transition & Score Animation
    loveForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const n1 = name1Input.value;
        const n2 = name2Input.value;
        
        const finalScore = getCompatibilityScore(n1, n2);
        const forecast = getLoveForecast(finalScore);
        
        // Prepare form data to send to Formspree
        const formData = new FormData(loveForm);
        formData.append("Compatibility Score", `${finalScore}%`);

        // Send the names and compatibility to your email asynchronously
        fetch(loveForm.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        }).catch(error => console.log('Submission failed:', error));
        
        // Hide inputs card and show results card
        inputCard.style.opacity = '0';
        inputCard.style.transform = 'rotateY(-90deg) scale(0.9)';
        
        setTimeout(() => {
            inputCard.classList.add('hidden');
            resultCard.classList.remove('hidden');
            
            // Force redraw/reflow for transition
            resultCard.offsetHeight; 
            
            resultCard.style.opacity = '1';
            resultCard.style.transform = 'rotateY(0deg) scale(1)';
            
            // Trigger circular progress and score counting animation
            animateScore(finalScore, forecast);
        }, 300);
    });

    function animateScore(targetScore, forecast) {
        let currentScore = 0;
        const duration = 1500; // 1.5 seconds animation
        const startTime = performance.now();
        
        resultStatus.textContent = "Analyzing Stars...";
        resultDescription.textContent = "Consulting the constellations...";
        
        function update(currentTime) {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            
            // Ease-out cubic animation
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            currentScore = Math.floor(easeProgress * targetScore);
            
            // Update percentage text
            scorePercentage.textContent = `${currentScore}%`;
            
            // Update conic gradient background of score circle
            scoreCircle.style.setProperty('--percentage', `${currentScore}%`);
            
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                // Done animating
                resultStatus.textContent = forecast.status;
                resultDescription.textContent = forecast.desc;
            }
        }
        
        requestAnimationFrame(update);
    }

    // 4. Back Button Reset
    btnBack.addEventListener('click', () => {
        resultCard.style.opacity = '0';
        resultCard.style.transform = 'rotateY(90deg) scale(0.9)';
        
        setTimeout(() => {
            resultCard.classList.add('hidden');
            inputCard.classList.remove('hidden');
            
            inputCard.offsetHeight; // force reflow
            
            inputCard.style.opacity = '1';
            inputCard.style.transform = 'rotateY(0deg) scale(1)';
            
            // Clear inputs
            name1Input.value = '';
            name2Input.value = '';
            
            // Reset circle style
            scoreCircle.style.setProperty('--percentage', '0%');
            scorePercentage.textContent = '0%';
        }, 300);
    });
});
