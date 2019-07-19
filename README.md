# GameInformer Scraper

### Overview
This is a full-stack website that let you scrape articles from certain websites. In this project, we scrape through gameinformer.com.  The scraped data are  headline, summar, link to the actual url, and a related image.   Hope you find your favorite articles.

### How to use
    - First, click on 'Scrape New Article', then all articles will be displayed.
    - Now, you can save your favorite articles. The saved articles will be disappear from the list.
    - To view all saved articles, click on 'Saved Articles' link.
    - On 'Saved Articles' link page, you can remove from saved articles or add your personal notes.
    - If you choose to remove from saved articles, the removed article will go back to all articles.
    - If you choose to clear article, all articles will be deleted from the database.
    
    
### In the code...
    - We use node.js and javascript in coding.
    - Express package is used to send request and received response.
    - The express-handlebars is used to render html pages. 
    - Articls data is stored in the database.  We use Mongoose as a database.
    - We use cheerios to handle html data from the target website.
    - Axios is used in sending a request to the target website from the server side.
    - We use MVC architecture to organize code and data in different layers.  

### Credit
Kanwee Kiatnikorn : Design, Coding, and Testing.