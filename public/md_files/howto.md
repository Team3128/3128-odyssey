
# How To Add Documentation

Adding documentation to **NARASK** consists of two main parts:  
- Writing the documentation  
- Correctly formatting your documentation  

---

## Preamble
This guide outlines how to add new documentation to **NARASK**, and provides guidelines for content and formatting to ensure everything displays correctly.  

**Author:** Shravya Mandadi  

---

## Writing the Documentation
- Use **clear instructions** and break your content into **logical subsections**.  
- Begin your file with a **preamble** that describes the purpose of your documentation.  
- Credit yourself and any contributors in the preamble.  
- After the preamble, provide **step-by-step instructions**.  

---

## Formatting Your Documentation

NARASK parses your Markdown into **subsections** using Markdown prefixes.  
Follow these rules to ensure your file displays correctly:

1. **Title**  
   Begin your file with a single top-level heading (`#`) with a short, descriptive name.  
   Example:  
   ``` # ExampleTitle ```

2. **Subsections**
    Use ## to define subsections. These will appear as expandable cards in the preview.
    Example:    
       ``` ## Example Subsection ```

3. **Paragraphs**
    Write paragraphs normally. Use bullet points (- or *) or numbered lists (1., 2.) when helpful.

4. **Code Blocks**
    For code snippets, use fenced code blocks (triple backticks).
Example:
    ``` System.out.println("Hello World");```

### Example File Structure
    # CodeStuff
        - Write Code
        - Commit Code
    # Preamble
        All about code
        Author: Somebody Someperson
    ## Repositories
    To initialize a new repository, run:
    ```
    git init
    ```
