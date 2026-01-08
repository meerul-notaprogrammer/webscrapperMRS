"""
Test script to verify Playwright and scraper functionality
"""
from playwright.async_api import async_playwright
import asyncio

async def test_playwright():
    print("=" * 50)
    print("PLAYWRIGHT SCRAPER TEST")
    print("=" * 50)
    
    async with async_playwright() as p:
        print("\n1. Launching browser...")
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        # Set user agent to look more human
        await page.set_extra_http_headers({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        })
        
        # Test 1: Basic website
        print("\n2. Testing example.com...")
        try:
            await page.goto('https://example.com', timeout=30000)
            title = await page.title()
            print(f"   ✅ Example.com title: {title}")
        except Exception as e:
            print(f"   ❌ Example.com failed: {e}")
        
        # Test 2: Target website
        print("\n3. Testing eperolehan.gov.my...")
        try:
            await page.goto('https://www.eperolehan.gov.my/quotation-tender-notice', timeout=60000)
            await page.wait_for_load_state("networkidle")
            
            content = await page.content()
            print(f"   Page loaded, content length: {len(content)} chars")
            
            # Check for anti-bot
            if 'captcha' in content.lower():
                print("   ⚠️ CAPTCHA detected!")
            elif 'cloudflare' in content.lower():
                print("   ⚠️ Cloudflare protection detected!")
            elif 'blocked' in content.lower():
                print("   ⚠️ Possible blocking detected!")
            else:
                print("   ✅ No obvious anti-bot protection")
            
            # Check for table
            if '<table' in content.lower():
                print("   ✅ Table found in content")
            else:
                print("   ⚠️ No table found - might need to wait longer")
            
            # Take screenshot for debugging
            await page.screenshot(path='/app/backend/debug_screenshot.png')
            print("   📸 Screenshot saved to debug_screenshot.png")
            
        except Exception as e:
            print(f"   ❌ Error: {e}")
        
        await browser.close()
        print("\n4. Browser closed")
    
    print("\n" + "=" * 50)
    print("TEST COMPLETE")
    print("=" * 50)

if __name__ == "__main__":
    asyncio.run(test_playwright())
