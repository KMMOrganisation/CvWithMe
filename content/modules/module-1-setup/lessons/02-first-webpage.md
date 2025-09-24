---
title: "Your First Webpage: index.html"
description: "Create your very first HTML file and understand the basic structure of a web page."
estimatedTime: "30-45 minutes"
tools: ['VS Code', 'Web Browser']
complexity: "Beginner"
prerequisites: ['Welcome! Your Digital Workshop']
order: 2
---

# Your First Webpage: index.html

## Introduction

Now that your digital workshop is set up, it's time to create your very first webpage! We'll create an `index.html` file - the main page that browsers look for when someone visits your website.

## Learning Objectives

By the end of this lesson, you will be able to:
- Create an HTML file in VS Code
- Understand the basic HTML document structure
- Use VS Code's HTML shortcuts
- View your webpage in a browser
- Customize your page title

## Prerequisites

- VS Code installed and project folder open
- Basic familiarity with VS Code interface

## Step-by-Step Instructions

### Step 1: Create Your First HTML File

Let's create the main file for your website:

1. In VS Code, look at the sidebar where you see `MYPORTFOLIOWEBSITE`
2. Hover over the folder name - you'll see some icons appear
3. Click the "New File" icon (looks like a document with a plus sign)
4. Type `index.html` and press **Enter**

![Creating index.html](../assets/images/create-index-html.png)
*Creating your first HTML file in VS Code*

💡 **Why "index.html"?** This is a special filename that web browsers automatically look for when someone visits your website. It's like the front door of your digital home!

### Step 2: The Magic HTML Shortcut

VS Code has an amazing shortcut to create a basic HTML structure instantly:

1. Make sure your cursor is in the empty `index.html` file
2. Type just an exclamation mark: `!`
3. Press the **Tab** key on your keyboard

🎉 **Magic!** VS Code automatically creates a complete HTML structure for you!

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    
</body>
</html>
```

### Step 3: Understanding Your HTML Structure

Let's understand what each part does:

**`<!DOCTYPE html>`**
- Tells the browser this is an HTML5 document (the latest version)

**`<html lang="en">`**
- The main container for your entire webpage
- `lang="en"` tells browsers the content is in English

**`<head>` section**
- The "brain" of your webpage
- Contains information for browsers, not visible to users
- Includes character encoding, viewport settings, and page title

**`<body>` section**
- Where all your visible content goes
- Everything users see on your webpage lives here

![HTML Structure Diagram](../assets/images/html-structure.png)
*Visual breakdown of HTML document structure*

### Step 4: Customize Your Page Title

Let's personalize your webpage:

1. Find the line: `<title>Document</title>`
2. Replace `Document` with `My Awesome Portfolio`
3. Your title line should now look like: `<title>My Awesome Portfolio</title>`

💡 **What does this do?** The title appears in the browser tab and when people bookmark your page.

### Step 5: Save and View Your Webpage

Time to see your creation in action:

1. Save your file: **File** → **Save** (or **Ctrl+S** on Windows, **Cmd+S** on Mac)
2. Go to your `MyPortfolioWebsite` folder on your computer
3. Find the `index.html` file and double-click it

Your webpage will open in your default browser! 

![First Webpage in Browser](../assets/images/first-webpage-browser.png)
*Your first webpage - notice the custom title in the browser tab*

You'll see a blank page, but look at the browser tab - it should say "My Awesome Portfolio"! 

## Practice Exercise

Try these modifications to get comfortable with HTML:

1. Change the title to your own name: `<title>John's Portfolio</title>`
2. Save the file and refresh your browser (F5 or Cmd+R)
3. Notice how the browser tab title changes

## Understanding the Code Structure

Let's break down what makes this HTML work:

```html
<!DOCTYPE html>                    <!-- Document type declaration -->
<html lang="en">                   <!-- Root element -->
<head>                            <!-- Document metadata -->
    <meta charset="UTF-8">        <!-- Character encoding -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">  <!-- Mobile responsiveness -->
    <title>My Awesome Portfolio</title>  <!-- Page title -->
</head>
<body>                            <!-- Visible content area -->
    <!-- Your content will go here -->
</body>
</html>
```

⚠️ **Important**: The `<body>` section is currently empty - that's why you see a blank page. In the next lesson, we'll add visible content!

## Summary

Fantastic! You've successfully:
- Created your first HTML file (`index.html`)
- Used VS Code's HTML shortcut (`!` + Tab)
- Understood the basic HTML document structure
- Customized your page title
- Viewed your webpage in a browser

## Next Steps

In the next lesson, "Adding Your First Content: Headings and Paragraphs", you'll:
- Add your name and introduction to the webpage
- Learn about HTML headings and paragraphs
- See actual text content appear on your page

## Troubleshooting

**Problem**: The `!` + Tab shortcut doesn't work
**Solution**: Make sure you're in an `.html` file and your cursor is on an empty line. Try typing `html:5` + Tab as an alternative.

**Problem**: The webpage doesn't open when I double-click
**Solution**: Make sure you saved the file with the `.html` extension. Right-click the file and choose "Open with" → your web browser.

**Problem**: I don't see the title change in the browser
**Solution**: Make sure you saved the file in VS Code, then refresh your browser page (F5 or the refresh button).