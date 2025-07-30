document.addEventListener('DOMContentLoaded', () => {
    // --- HVP Phrases from your provided PDF ---

    // Part I phrases, corrected to exactly match the provided document.
    const part1Phrases = [
        "A technical improvement", // [cite: 5]
        "A good meal", // [cite: 10]
        "Nonsense", // [cite: 24]
        "A fine", // 
        "A rubbish heap", // [cite: 26]
        "A devoted scientist", // [cite: 27]
        "Blow up an airline in flight", // [cite: 28]
        "Burn a heretic at the stake", // [cite: 42]
        "A short circuit", // [cite: 43]
        "\"With this ring I thee wed\"", // [cite: 44]
        "A baby", // [cite: 48]
        "Torture a person in a concentration camp", // [cite: 49, 51]
        "Love of nature", // [cite: 54]
        "A madman", // [cite: 60]
        "An assembly line", // [cite: 62]
        "A uniform", // [cite: 71]
        "Slavery", // [cite: 73]
        "A mathematical genius" // [cite: 74]
    ];
    
    // Part II phrases, as listed in the provided document.
    const part2Phrases = [
        "\"I like my work it does me good.\"", // [cite: 98]
        "\"The universe is a remarkably harmonious system.\"", // [cite: 99]
        "\"The world makes little sense to me.\"", // [cite: 110]
        "\"No matter how hard I work. I shall always feel frustrated.\"", // [cite: 111, 112]
        "\"My working conditions are poor, and ruin my work.\"", // [cite: 113]
        "\"I feel at home in the world.\"", // [cite: 114]
        "\"I hate my work.\"", // [cite: 122]
        "\"My life is messing up the world.\"", // [cite: 123]
        "\"My work contributes nothing to the world.\"", // [cite: 124]
        "\"My work brings out the best in me.\"", // [cite: 125]
        "\"I enjoy being myself.\"", // [cite: 130]
        "\"I curse the day I was born.\"", // [cite: 134]
        "\"I love my work.\"", // [cite: 140]
        "\"The lack of meaning in the universe disturbs me.\"", // [cite: 141]
        "\"The more I understand my place in the world, the better I get in my work.\"", // [cite: 142]
        "\"My work makes me unhappy.\"", // [cite: 143]
        "\"I love the beauty of the world.\"", // [cite: 150]
        "\"My work adds to the beauty and harmony of the world.\"" // [cite: 151]
    ];

    // --- State Management ---
    const assessmentData = {
        user: {},
        part1Ranking: [],
        part2Ranking: []
    };

    // --- DOM Elements ---
    const screens = {
        start: document.getElementById('start-screen'),
        part1: document.getElementById('part1-screen'),
        part2: document.getElementById('part2-screen'),
        completion: document.getElementById('completion-screen')
    };
    
    const userForm = document.getElementById('user-form');
    const part1Container = document.getElementById('part1-phrases');
    const part2Container = document.getElementById('part2-phrases');

    // --- Functions ---
    function showScreen(screenName) {
        Object.values(screens).forEach(screen => screen.style.display = 'none');
        screens[screenName].style.display = 'block';
    }

    function populatePhrases(container, phrases) {
        container.innerHTML = ''; // Clear existing phrases
        phrases.forEach(phrase => {
            const item = document.createElement('div');
            item.className = 'phrase-item';
            item.textContent = phrase;
            item.setAttribute('data-id', phrase);
            container.appendChild(item);
        });
    }
    
    // --- Initialize SortableJS ---
    const sortablePart1 = new Sortable(part1Container, { animation: 150 });
    const sortablePart2 = new Sortable(part2Container, { animation: 150 });

    // --- Event Listeners ---
    userForm.addEventListener('submit', (e) => {
        e.preventDefault();
        assessmentData.user = {
            name: document.getElementById('user-name').value,
            email: document.getElementById('user-email').value,
            phone: document.getElementById('user-phone').value
        };
        populatePhrases(part1Container, [...part1Phrases].sort(() => Math.random() - 0.5));
        showScreen('part1');
    });

    document.getElementById('complete-part1-btn').addEventListener('click', () => {
        assessmentData.part1Ranking = sortablePart1.toArray();
        populatePhrases(part2Container, [...part2Phrases].sort(() => Math.random() - 0.5));
        showScreen('part2');
    });

    document.getElementById('back-to-part1-btn').addEventListener('click', () => {
        showScreen('part1');
    });

    document.getElementById('complete-all-btn').addEventListener('click', async () => {
        assessmentData.part2Ranking = sortablePart2.toArray();
        
        try {
            const response = await fetch('/.netlify/functions/submit-assessment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(assessmentData),
            });

            if (response.ok) {
                showScreen('completion');
            } else {
                alert('There was an error submitting your assessment. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('A network error occurred. Please check your connection and try again.');
        }
    });

    document.getElementById('disclaimer-link').addEventListener('click', (e) => {
        e.preventDefault();
        alert("Disclaimer: This tool is used by BIAMIC Coaching and Consulting as a base assessment for Coaching engagements. Your data will be sent to the assessment mediator, and a copy will be sent to you. The data, on its own, has little value, but once processed, the value is very evident. Our standard confidentiality commitments are honoured.");
    });
});