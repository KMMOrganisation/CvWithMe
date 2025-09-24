---
title: "Adding Your First Content: Headings and Paragraphs"
description: "Learn how to add text content to your webpage using HTML headings and paragraphs."
estimatedTime: "30-45 minutes"
tools: ['VS Code', 'Web Browser']
complexity: "Beginner"
prerequisites: ['Your First Webpage: index.html']
order: 3
---

# Adding Your First Content: Headings and Paragraphs

## Introduction

Now that you have your basic HTML structure, it's time to add some actual content that visitors can see! In this lesson, we'll add headings and paragraphs to make your webpage come alive.

## Learning Objectives

By the end of this lesson, you will be able to:
- Add main headings using `<h1>` tags
- Create subheadings with `<h2>` tags  
- Write paragraphs using `<p>` tags
- Understand the hierarchy of HTML headings
- See your content displayed in the browser

## Prerequisites

- Completed "Your First Webpage: index.html"
- VS Code open with your project
- Basic understanding of HTML structure

## Step-by-Step Instructions

### Step 1: Add Your Main Heading

Let's start by adding your name as the main heading of your portfolio:

1. In VS Code, open your `index.html` file
2. Find the `<body>` section (it should be empty right now)
3. Click inside the `<body>` tags to position your cursor
4. Type `<h1` and press **Tab** (VS Code will complete it to `<h1></h1>`)
5. Between the tags, type your name: `Hello, I'm Alex!`

Your code should look like this:

```html
<body>
    <h1>Hello, I'm Alex!</h1>
</body>
```

💡 **Pro Tip**: The `<h1>` tag is for your most important heading - there should only be one per page!

### Step 2: Add a Subheading

Now let's add a subtitle that describes what you do:

1. Press **Enter** to create a new line after your `<h1>` tag
2. Type `<h2` and press **Tab**
3. Add your subtitle: `Web Developer & Creative Thinker`

```html
<body>
    <h1>Hello, I'm Alex!</h1>
    <h2>Web Developer & Creative Thinker</h2>
</body>
```

### Step 3: Add Your First Paragraph

Let's add a welcome message for visitors to your site:

1. Create a new line after your `<h2>` tag
2. Type `<p` and press **Tab**
3. Add your welcome message: `Welcome to my portfolio! I build beautiful and functional websites.`

```html
<body>
    <h1>Hello, I'm Alex!</h1>
    <h2>Web Developer & Creative Thinker</h2>
    <p>Welcome to my portfolio! I build beautiful and functional websites.</p>
</body>
```

### Step 4: Save and View Your Progress

Time to see your content in action:

1. Save your file (**Ctrl+S** or **Cmd+S**)
2. Go to your browser tab with `index.html` open
3. Refresh the page (F5 or the refresh button)

🎉 **Amazing!** You should now see your name, subtitle, and welcome message displayed on your webpage!

![First Content in Browser](../assets/images/first-content-browser.png)
*Your webpage now has visible content - notice the different text sizes*

## Understanding HTML Headings

HTML has six levels of headings, from `<h1>` (most important) to `<h6>` (least important):

```html
<h1>Most Important Heading</h1>
<h2>Secondary Heading</h2>
<h3>Third Level Heading</h3>
<h4>Fourth Level Heading</h4>
<h5>Fifth Level Heading</h5>
<h6>Least Important Heading</h6>
```

⚠️ **Important**: Use headings in order! Don't skip from `<h1>` to `<h3>` - this helps with accessibility and SEO.

## Practice Exercise

Try adding more content to your page:

1. Add another paragraph below your welcome message
2. Experiment with different heading levels
3. Write a short bio about yourself

Example:
```html
<body>
    <h1>Hello, I'm Alex!</h1>
    <h2>Web Developer & Creative Thinker</h2>
    <p>Welcome to my portfolio! I build beautiful and functional websites.</p>
    <p>I'm passionate about creating user-friendly experiences and love learning new technologies.</p>
</body>
```

## Common Mistakes to Avoid

❌ **Don't do this:**
```html
<h1>My Name</h1>
<h3>Skipping h2</h3>  <!-- Skipped h2 level -->
```

✅ **Do this instead:**
```html
<h1>My Name</h1>
<h2>My Subtitle</h2>  <!-- Proper heading order -->
```

## Summary

Congratulations! You've successfully:
- Added your first `<h1>` heading with your name
- Created a `<h2>` subheading for your title
- Written your first `<p>` paragraph with a welcome message
- Learned about HTML heading hierarchy
- Seen your content displayed in the browser

Your webpage is starting to take shape! The content is there, but it might look a bit plain. Don't worry - in the next module, we'll learn CSS to make it look amazing.

## Next Steps

In the next lesson, "Exploring Your Portfolio's Sections", you'll:
- Organize your content into logical sections
- Learn about semantic HTML elements
- Structure your portfolio like a professional website

## Troubleshooting

**Problem**: My headings all look the same size
**Solution**: Make sure you're using different heading tags (`<h1>`, `<h2>`, etc.) - browsers automatically style them differently.

**Problem**: I don't see my content in the browser
**Solution**: Make sure you saved the file in VS Code and refreshed your browser page.

**Problem**: My HTML tags are showing on the page
**Solution**: Check that you have both opening and closing tags (e.g., `<h1>` and `</h1>`) and that they're properly nested.