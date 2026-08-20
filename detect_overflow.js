const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Test widths
    const widths = [320, 360, 375, 390, 412, 430, 480];
    
    for (const width of widths) {
        console.log(`\n=== Testing Viewport Width: ${width}px ===`);
        await page.setViewport({ width, height: 800 });
        
        await page.goto('http://localhost:8080', { waitUntil: 'networkidle0' });
        
        // Let animations settle
        await new Promise(r => setTimeout(r, 2000));
        
        const overflowElements = await page.evaluate(() => {
            const viewportWidth = document.documentElement.clientWidth;
            const docScroll = document.documentElement.scrollWidth;
            const bodyScroll = document.body.scrollWidth;
            
            console.log(`Viewport: ${viewportWidth}, docScroll: ${docScroll}, bodyScroll: ${bodyScroll}`);
            
            if (docScroll <= viewportWidth && bodyScroll <= viewportWidth) {
                return []; // No document level overflow
            }
            
            const overflowing = [];
            const allElements = document.querySelectorAll('*');
            
            for (const el of allElements) {
                const rect = el.getBoundingClientRect();
                const style = window.getComputedStyle(el);
                
                // If the element extends beyond the right edge of the viewport
                if (rect.right > viewportWidth && style.display !== 'none' && rect.width > 0) {
                    // Check if it's intentionally scrollable
                    let isScrollContainer = false;
                    let parent = el.parentElement;
                    while (parent && parent !== document.body) {
                        const parentStyle = window.getComputedStyle(parent);
                        if (parentStyle.overflowX === 'auto' || parentStyle.overflowX === 'scroll') {
                            isScrollContainer = true;
                            break;
                        }
                        parent = parent.parentElement;
                    }
                    
                    if (!isScrollContainer) {
                        overflowing.push({
                            tag: el.tagName,
                            id: el.id,
                            className: el.className,
                            right: rect.right,
                            width: rect.width,
                            left: rect.left
                        });
                    }
                }
            }
            return overflowing;
        });
        
        if (overflowElements.length === 0) {
            console.log("No horizontal overflow detected.");
        } else {
            console.log(`Found ${overflowElements.length} overflowing elements:`);
            const sorted = overflowElements.sort((a, b) => b.right - a.right).slice(0, 5); // top 5 worst offenders
            console.table(sorted);
        }
    }
    
    await browser.close();
})();
