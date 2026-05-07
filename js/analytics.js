document.addEventListener('DOMContentLoaded', () => {
    const pageViewData = {
        pages: {},
        totalVisits: 0,
        uniqueVisitors: 0,
        referrers: {},
        timestamps: []
    };

    function getStoredData() {
        const stored = localStorage.getItem('siteAnalytics');
        if (stored) {
            return JSON.parse(stored);
        }
        return null;
    }

    function saveData() {
        localStorage.setItem('siteAnalytics', JSON.stringify(pageViewData));
    }

    function trackPageView() {
        const currentPage = window.location.pathname || '/';
        const timestamp = new Date().toISOString();
        const referrer = document.referrer || 'direct';
        
        if (!pageViewData.pages[currentPage]) {
            pageViewData.pages[currentPage] = {
                views: 0,
                lastViewed: null,
                firstViewed: timestamp
            };
        }
        
        pageViewData.pages[currentPage].views++;
        pageViewData.pages[currentPage].lastViewed = timestamp;
        pageViewData.totalVisits++;
        pageViewData.timestamps.push(timestamp);

        if (!pageViewData.referrers[referrer]) {
            pageViewData.referrers[referrer] = 0;
        }
        pageViewData.referrers[referrer]++;

        const visitorId = getOrCreateVisitorId();
        console.log(`Page view tracked: ${currentPage} | Visitor: ${visitorId} | Referrer: ${referrer}`);
        
        saveData();
    }

    function getOrCreateVisitorId() {
        let visitorId = sessionStorage.getItem('visitorId');
        if (!visitorId) {
            visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('visitorId', visitorId);
        }
        return visitorId;
    }

    function trackScrollDepth() {
        let maxScroll = 0;
        const thresholds = [25, 50, 75, 100];
        const trackedThresholds = new Set();

        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );

            thresholds.forEach(threshold => {
                if (scrollPercent >= threshold && !trackedThresholds.has(threshold)) {
                    trackedThresholds.add(threshold);
                    console.log(`Scroll depth: ${threshold}%`);
                    
                    if (!pageViewData.scrollDepth) {
                        pageViewData.scrollDepth = {};
                    }
                    pageViewData.scrollDepth[threshold] = (pageViewData.scrollDepth[threshold] || 0) + 1;
                    saveData();
                }
            });
        }, { passive: true });
    }

    function trackButtonClicks() {
        document.querySelectorAll('a, button').forEach(element => {
            element.addEventListener('click', () => {
                const label = element.textContent.trim() || element.getAttribute('href') || 'unknown';
                console.log(`Button clicked: ${label}`);
                
                if (!pageViewData.clicks) {
                    pageViewData.clicks = {};
                }
                pageViewData.clicks[label] = (pageViewData.clicks[label] || 0) + 1;
                saveData();
            });
        });
    }

    function getTimeOnPage() {
        const startTime = Date.now();
        
        window.addEventListener('beforeunload', () => {
            const timeOnPage = Math.round((Date.now() - startTime) / 1000);
            console.log(`Time on page: ${timeOnPage}s`);
            
            if (!pageViewData.timeOnPage) {
                pageViewData.timeOnPage = [];
            }
            pageViewData.timeOnPage.push(timeOnPage);
            saveData();
        });
    }

    function getAnalytics() {
        return getStoredData() || pageViewData;
    }

    function resetAnalytics() {
        localStorage.removeItem('siteAnalytics');
        sessionStorage.removeItem('visitorId');
        location.reload();
    }

    const storedData = getStoredData();
    if (storedData) {
        Object.assign(pageViewData, storedData);
    }

    trackPageView();
    trackScrollDepth();
    trackButtonClicks();
    getTimeOnPage();

    window.siteAnalytics = {
        get: getAnalytics,
        reset: resetAnalytics
    };
});
