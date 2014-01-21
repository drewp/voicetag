voicetag
========

Deployment
----------
Serve index.html, etc. somehow. Most of this is browser-side.

If you want to use the image saver
----------------------------------

1. Get nodejs depedencies: 
  npm install
  
2. Run the service:
  nodejs newImage.js
  
3. Route some path that your users can see back to http://localhost:8883/

4. Guard against random people dumping terabytes of data into the pic/ output directory.
