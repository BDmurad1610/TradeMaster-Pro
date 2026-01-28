// Binance API Integration for TradeMaster Pro

class BinanceAPI {
    constructor() {
        this.baseURL = 'https://api.binance.com/api/v3';
        this.wsURL = 'wss://stream.binance.com:9443/ws';
        this.sockets = {};
    }

    // Get current price
    async getPrice(symbol = 'BTCUSDT') {
        try {
            const response = await fetch(`${this.baseURL}/ticker/price?symbol=${symbol}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching price:', error);
            return null;
        }
    }

    // Get 24hr ticker
    async get24hrTicker(symbol = 'BTCUSDT') {
        try {
            const response = await fetch(`${this.baseURL}/ticker/24hr?symbol=${symbol}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching 24hr ticker:', error);
            return null;
        }
    }

    // Get kline/candlestick data
    async getKlines(symbol = 'BTCUSDT', interval = '1h', limit = 100) {
        try {
            const response = await fetch(
                `${this.baseURL}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
            );
            const data = await response.json();
            
            // Format data for charting
            return data.map(k => ({
                time: k[0] / 1000,
                open: parseFloat(k[1]),
                high: parseFloat(k[2]),
                low: parseFloat(k[3]),
                close: parseFloat(k[4]),
                volume: parseFloat(k[5])
            }));
        } catch (error) {
            console.error('Error fetching klines:', error);
            return null;
        }
    }

    // WebSocket for real-time data
    connectWebSocket(symbol = 'btcusdt', stream = 'kline_1m', callback) {
        const socketKey = `${symbol}@${stream}`;
        
        if (this.sockets[socketKey]) {
            return this.sockets[socketKey];
        }

        const ws = new WebSocket(`${this.wsURL}/${socketKey}`);
        
        ws.onopen = () => {
            console.log(`WebSocket connected: ${socketKey}`);
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (callback && typeof callback === 'function') {
                callback(data);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
            console.log(`WebSocket closed: ${socketKey}`);
            delete this.sockets[socketKey];
            
            // Reconnect after 5 seconds
            setTimeout(() => {
                this.connectWebSocket(symbol, stream, callback);
            }, 5000);
        };

        this.sockets[socketKey] = ws;
        return ws;
    }

    // Close WebSocket
    closeWebSocket(symbol = 'btcusdt', stream = 'kline_1m') {
        const socketKey = `${symbol}@${stream}`;
        if (this.sockets[socketKey]) {
            this.sockets[socketKey].close();
        }
    }

    // Get multiple symbols
    async getMultiplePrices(symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT']) {
        try {
            const response = await fetch(`${this.baseURL}/ticker/price`);
            const allPrices = await response.json();
            
            return symbols.map(symbol => 
                allPrices.find(p => p.symbol === symbol)
            ).filter(Boolean);
        } catch (error) {
            console.error('Error fetching multiple prices:', error);
            return [];
        }
    }

    // Get exchange info
    async getExchangeInfo() {
        try {
            const response = await fetch(`${this.baseURL}/exchangeInfo`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching exchange info:', error);
            return null;
        }
    }
}

// Payment & Withdrawal System
class PaymentSystem {
    constructor() {
        this.commissionRate = 0.4; // 40%
        this.minWithdrawal = 20;
        this.usdtAddress = 'TExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'; // Replace with your USDT address
    }

    // Calculate commission
    calculateCommission(amount) {
        return amount * this.commissionRate;
    }

    // Process referral commission
    processReferralCommission(referrerId, amount, referralCode) {
        const commission = this.calculateCommission(amount);
        
        // Save commission to database (simulated)
        const transaction = {
            id: 'tx_' + Date.now(),
            referrerId: referrerId,
            amount: amount,
            commission: commission,
            referralCode: referralCode,
            date: new Date().toISOString(),
            status: 'pending'
        };
        
        // Simulate database save
        let commissions = JSON.parse(localStorage.getItem('commissions') || '[]');
        commissions.push(transaction);
        localStorage.setItem('commissions', JSON.stringify(commissions));
        
        return commission;
    }

    // Get user commissions
    getUserCommissions(userId) {
        const commissions = JSON.parse(localStorage.getItem('commissions') || '[]');
        return commissions.filter(tx => tx.referrerId === userId);
    }

    // Get total commission earned
    getTotalCommission(userId) {
        const commissions = this.getUserCommissions(userId);
        return commissions.reduce((total, tx) => total + tx.commission, 0);
    }

    // Process withdrawal
    async processWithdrawal(userId, amount, usdtAddress) {
        if (amount < this.minWithdrawal) {
            throw new Error(`Minimum withdrawal is $${this.minWithdrawal}`);
        }

        const totalCommission = this.getTotalCommission(userId);
        if (amount > totalCommission) {
            throw new Error('Insufficient commission balance');
        }

        // Create withdrawal record
        const withdrawal = {
            id: 'wd_' + Date.now(),
            userId: userId,
            amount: amount,
            usdtAddress: usdtAddress,
            date: new Date().toISOString(),
            status: 'processing',
            txHash: null
        };

        // Save withdrawal (simulated)
        let withdrawals = JSON.parse(localStorage.getItem('withdrawals') || '[]');
        withdrawals.push(withdrawal);
        localStorage.setItem('withdrawals', JSON.stringify(withdrawals));

        // Simulate processing delay
        return new Promise((resolve) => {
            setTimeout(() => {
                withdrawal.status = 'completed';
                withdrawal.txHash = '0x' + Math.random().toString(36).substr(2, 64);
                localStorage.setItem('withdrawals', JSON.stringify(withdrawals));
                resolve(withdrawal);
            }, 2000);
        });
    }

    // Get withdrawal history
    getWithdrawalHistory(userId) {
        const withdrawals = JSON.parse(localStorage.getItem('withdrawals') || '[]');
        return withdrawals.filter(wd => wd.userId === userId);
    }
}

// Learning System
class LearningSystem {
    constructor() {
        this.levels = [
            {
                id: 1,
                name: 'Beginner',
                lessons: [
                    { id: 1, title: 'What is Trading?', duration: '10 min', completed: false },
                    { id: 2, title: 'Candlestick Basics', duration: '15 min', completed: false },
                    { id: 3, title: 'Support & Resistance', duration: '20 min', completed: false },
                    { id: 4, title: 'Risk Management', duration: '25 min', completed: false }
                ]
            },
            {
                id: 2,
                name: 'Intermediate',
                lessons: [
                    { id: 5, title: 'RSI Indicator', duration: '20 min', completed: false },
                    { id: 6, title: 'MACD Strategy', duration: '25 min', completed: false },
                    { id: 7, title: 'Moving Averages', duration: '30 min', completed: false },
                    { id: 8, title: 'Trend Analysis', duration: '35 min', completed: false }
                ]
            },
            {
                id: 3,
                name: 'Advanced',
                lessons: [
                    { id: 9, title: 'Fibonacci Retracement', duration: '30 min', completed: false },
                    { id: 10, title: 'Harmonic Patterns', duration: '40 min', completed: false },
                    { id: 11, title: 'Market Psychology', duration: '45 min', completed: false },
                    { id: 12, title: 'Algorithm Trading Intro', duration: '50 min', completed: false }
                ]
            }
        ];
        
        this.userProgress = JSON.parse(localStorage.getItem('learningProgress') || '{}');
    }

    // Get user progress
    getUserProgress(userId) {
        return this.userProgress[userId] || { currentLevel: 1, currentLesson: 1, completedLessons: [] };
    }

    // Mark lesson as completed
    completeLesson(userId, levelId, lessonId) {
        if (!this.userProgress[userId]) {
            this.userProgress[userId] = { currentLevel: 1, currentLesson: 1, completedLessons: [] };
        }
        
        const progress = this.userProgress[userId];
        const lessonKey = `level${levelId}_lesson${lessonId}`;
        
        if (!progress.completedLessons.includes(lessonKey)) {
            progress.completedLessons.push(lessonKey);
            
            // Move to next lesson
            const currentLevel = this.levels.find(l => l.id === levelId);
            if (currentLevel) {
                const currentLessonIndex = currentLevel.lessons.findIndex(l => l.id === lessonId);
                if (currentLessonIndex < currentLevel.lessons.length - 1) {
                    progress.currentLesson = currentLevel.lessons[currentLessonIndex + 1].id;
                } else {
                    // Move to next level
                    const nextLevel = this.levels.find(l => l.id === levelId + 1);
                    if (nextLevel) {
                        progress.currentLevel = nextLevel.id;
                        progress.currentLesson = nextLevel.lessons[0].id;
                    }
                }
            }
            
            localStorage.setItem('learningProgress', JSON.stringify(this.userProgress));
        }
    }

    // Calculate progress percentage
    getProgressPercentage(userId) {
        const progress = this.getUserProgress(userId);
        const totalLessons = this.levels.reduce((total, level) => total + level.lessons.length, 0);
        const completedLessons = progress.completedLessons.length;
        
        return Math.round((completedLessons / totalLessons) * 100);
    }

    // Get current lesson
    getCurrentLesson(userId) {
        const progress = this.getUserProgress(userId);
        const currentLevel = this.levels.find(l => l.id === progress.currentLevel);
        
        if (currentLevel) {
            return currentLevel.lessons.find(l => l.id === progress.currentLesson);
        }
        
        return this.levels[0].lessons[0];
    }

    // Get all lessons
    getAllLessons() {
        return this.levels;
    }
}

// Export modules for use in other files
window.BinanceAPI = BinanceAPI;
window.PaymentSystem = PaymentSystem;
window.LearningSystem = LearningSystem;

// Initialize global instances
window.binanceAPI = new BinanceAPI();
window.paymentSystem = new PaymentSystem();
window.learningSystem = new LearningSystem();