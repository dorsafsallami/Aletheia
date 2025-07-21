console.log("popup.js loaded");


document.addEventListener('DOMContentLoaded', () => {
    const postsContainer = document.getElementById('posts');
    const API_URL = 'http://localhost:5000';



    // Fetch and display posts on load
    fetchPosts();

function fetchPosts() {
        console.log('Fetching posts from server...'); // Debug log
    
        fetch(`${API_URL}/posts`)
            .then(response => response.json())
            .then(posts => {
                console.log('Fetched posts:', posts); // Debug log
                postsContainer.innerHTML = ''; // Clear existing posts
                posts.forEach(post => createPost(post));
            })
            .catch(error => console.error('Error fetching posts:', error));
    }
    

function createPost(post) {
        if (!post || typeof post !== 'object') {
            console.error('Invalid post object passed to createPost:', post);
            return;
        }
    
        console.log('Creating post:', post); // Debug log
    
        // Post container
        const postElement = document.createElement('div');
        postElement.classList.add('post');
    
        // Post content
        const postContent = document.createElement('p');
        postContent.textContent = post.content || 'No content';
        postElement.appendChild(postContent);
    
        // Post controls
        const postControls = document.createElement('div');
        postControls.classList.add('post-controls');
    
        // Upvote button and count
        const upvoteBtn = document.createElement('button');
        //upvoteBtn.textContent = '▲';
        upvoteBtn.classList.add('upvote-btn');
        upvoteBtn.innerHTML = '<i class="fas fa-thumbs-up"></i>';
        const upvoteCount = document.createElement('span');
        upvoteCount.textContent = post.upvotes;
        upvoteCount.classList.add('vote-count');
        upvoteBtn.addEventListener('click', () => votePost(post.id, 'upvote', upvoteCount));
    
        // Downvote button and count
        const downvoteBtn = document.createElement('button');
        //downvoteBtn.textContent = '▼';
        downvoteBtn.classList.add('downvote-btn');
        downvoteBtn.innerHTML = '<i class="fas fa-thumbs-down"></i>'; 
        const downvoteCount = document.createElement('span');
        downvoteCount.textContent = post.downvotes;
        downvoteCount.classList.add('vote-count');
        downvoteBtn.addEventListener('click', () => votePost(post.id, 'downvote', downvoteCount));
    
        // Append vote controls
        postControls.appendChild(upvoteBtn);
        postControls.appendChild(upvoteCount);
        postControls.appendChild(downvoteBtn);
        postControls.appendChild(downvoteCount);
    
        // Add verification status with icons
//const verificationStatus = document.createElement('span'); // Use a span to wrap icon and text
//verificationStatus.classList.add('verification-status'); // Optional class for styling

const icon = document.createElement('i'); // Create the icon element
const statusText = document.createElement('span'); // Text element

/*
if (post.verification_status === 'verified') {
    icon.classList.add('fas', 'fa-check-circle', 'verified-icon'); // Font Awesome check-circle for verified
    verificationStatus.appendChild(icon);
    statusText.textContent = 'Verified'; // Add text after the icon
} else if (post.verification_status === 'not_verified') {
    icon.classList.add('fas', 'fa-times-circle', 'not-verified-icon'); // Font Awesome times-circle for not verified
    verificationStatus.appendChild(icon);
    statusText.textContent = 'Wrong'; // Add text after the icon
} else if (post.verification_status === 'pending') {
    icon.classList.add('fas', 'fa-hourglass-half', 'pending-icon'); // Font Awesome hourglass-half for pending
    verificationStatus.appendChild(icon);
    statusText.textContent = 'Pending Verification'; // Add text after the icon
}
verificationStatus.appendChild(icon); // Add icon to the wrapper
verificationStatus.appendChild(statusText); // Add text to the wrapper
// Append the verification status to postControls
postControls.appendChild(verificationStatus);

if (post.badge) {
    const badge = document.createElement('div');
    badge.classList.add('badge');

    const badgeIcon = document.createElement('i');
    if (post.badge === 'community_trusted') {
        badgeIcon.classList.add('fas', 'fa-shield-alt'); // Green shield icon
        badge.classList.add('community-trusted');
        badge.textContent = ' Community Trusted';
    } else if (post.badge === 'debunked') {
        badgeIcon.classList.add('fas', 'fa-times-circle'); // Red cross icon
        badge.classList.add('debunked');
        badge.textContent = ' Debunked';
    } else if (post.badge === 'most_controversial') {
        badgeIcon.classList.add('fas', 'fa-fire'); // Yellow flame icon
        badge.classList.add('most-controversial');
        badge.textContent = ' Most Controversial';
    }

    badge.prepend(badgeIcon); // Add icon to the beginning
    postElement.appendChild(badge); // Add the badge to the post
}

 */
        // Append controls to the post
        postElement.appendChild(postControls);
   
        // Comments section
        const commentsSection = document.createElement('div');
        commentsSection.classList.add('comments-section');
        if (Array.isArray(post.comments)) {
            post.comments.forEach((comment) => {
                const commentItem = document.createElement('div');
                commentItem.classList.add('comment-item');
                commentItem.textContent = comment;
                commentsSection.appendChild(commentItem);
            });
        }
    
        // Add comment input
        const commentInput = document.createElement('textarea');
        commentInput.placeholder = 'Add a comment...';
    
        const addCommentBtn = document.createElement('button');
        addCommentBtn.textContent = 'Add Comment';
        addCommentBtn.classList.add('add-comment');
        addCommentBtn.addEventListener('click', () => {
            addComment(post.id, commentInput.value, commentsSection, commentInput);
        });
    
        // Append comments section and input
        postElement.appendChild(commentsSection);
        postElement.appendChild(commentInput);
        postElement.appendChild(addCommentBtn);
    
        // Append the post to the DOM
        postsContainer.appendChild(postElement);
        console.log('Post successfully appended:', postElement);
    }
    
    
function addComment(postId, commentText, commentsSection, commentInput) {
        fetch(`${API_URL}/posts/${postId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comment: commentText }),
        })
            .then(response => response.json())
            .then(updatedPost => {
                const commentItem = document.createElement('div'); // Use a div instead of li
                commentItem.classList.add('comment-item'); // Add class for styling
                commentItem.textContent = commentText; // Set the comment text
                commentsSection.appendChild(commentItem); // Append to comments section
                commentInput.value = ''; // Clear input field
            })
            .catch(error => console.error('Error adding comment:', error));
    }


function addPost(content) {
        console.log('Adding post with content:', content); // Debug log
    
        fetch(`${API_URL}/posts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content }),
        })
            .then(response => {
                console.log('Response status:', response.status); // Debug log
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(newPost => {
                console.log('New post created:', newPost); // Debug log
    
               // Ensure the post object has all required properties
            if (newPost && newPost.content) {
                createPost(newPost);
            } else {
                console.error('New post is missing required properties:', newPost);
            }
    
                // Optionally fetch all posts
                fetchPosts();
            })
            .catch(error => console.error('Error adding post:', error));
    }
    
    

    

function votePost(postId, voteType, voteCountElement) {
        fetch(`${API_URL}/posts/${postId}/vote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vote: voteType }),
        })
            .then((response) => response.json())
            .then((updatedPost) => {
                if (voteType === 'upvote') {
                    voteCountElement.textContent = updatedPost.upvotes;
                } else if (voteType === 'downvote') {
                    voteCountElement.textContent = updatedPost.downvotes;
                }
            })
            .catch((error) => console.error('Error voting on post:', error));
    }
    
    
    
    
document.getElementById('postButton').addEventListener('click', () => {
        const newPostInput = document.getElementById('newPost');
        const content = newPostInput.value.trim();
    
        console.log('Post button clicked, content:', content); // Debug log
    
        if (!content) {
            alert('Post content cannot be empty.');
            return;
        }
    
        addPost(content); // Call addPost
        newPostInput.value = ''; // Clear the input field
    });
    
    
    


    
    
});








document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab');
    const sections = document.querySelectorAll('.section');

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            // Activate the clicked tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Show the corresponding section
            sections.forEach(s => s.classList.remove('active'));
            sections[index].classList.add('active');
        });
    });

    // Default to showing the Detection section
    tabs[0].classList.add('active');
    sections[0].classList.add('active');
});



// Detect fake news on button click
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM fully loaded and parsed');

    const detectButton = document.getElementById('detectButton');
    const resultElement = document.getElementById('result');
    const confidenceElement = document.getElementById('confidence');
    const explanationButton = document.getElementById('explanationButton');
    const explanationElement = document.getElementById('explanation');

    // Ensure elements exist before adding event listeners
    if (!detectButton || !resultElement || !confidenceElement || !explanationButton || !explanationElement) {
        console.error('Required DOM elements are missing!');
        return;
    }

    detectButton.addEventListener('click', function () {
        console.log('Detect button clicked');
        const newsText = document.getElementById('newsInput').value;
        console.log('News input text:', newsText);

        // Call sendTextForDetection function to handle the request
        sendTextForDetection(newsText);
    });

    // Function to send text to backend for detection
    function sendTextForDetection(text) {
        if (text.length > 0) {
            resultElement.innerText = 'Analyzing...';

            // Send request to backend for fake news detection using fetch
            fetch('http://localhost:5000/detect', {  // Ensure your backend is running at this URL
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: text }),  // Send the text content
            })
            .then(response => response.json())
            .then(data => {
                console.log('Response data:', data);
                
                // Check if elements exist before trying to modify them
                if (resultElement) resultElement.innerText = `Detection Result: ${data.result}`;
                if (confidenceElement) confidenceElement.innerText = `Confidence: ${data.confidence}%`;

                // Show the explanation button
                if (explanationButton) explanationButton.style.display = 'block';
            })
            .catch(error => {
                console.error('Error during detection:', error);
                if (resultElement) resultElement.innerText = 'Error detecting fake news. Please try again.';
            });
        } else {
            if (resultElement) resultElement.innerText = 'Please enter news to analyze.';
        }
    }

    // Add event listener for the 'Show Explanation' button
    explanationButton.addEventListener('click', function () {
        const newsText = document.getElementById('newsInput').value;

        // Send request to backend for explanation using fetch
        fetch('http://localhost:5000/explanation', {  // Ensure your backend is running at this URL
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: newsText })
        })
        .then(response => response.json())
.then(data => {
    if (data.explanation) {
        const explanationContainer = document.getElementById('explanation');
        data.explanation.forEach(item => {
            if (item.type === 'intro') {
                const p = document.createElement('p');
                p.innerHTML = `<strong style="color: black;">${item.content}</strong>`;
                explanationContainer.appendChild(p);
            } else if (item.type === 'evidence') {
                const div = document.createElement('div');
                div.className = 'evidence-item';

                const title = document.createElement('p');
                title.className = 'evidence-title';
                title.innerHTML = `<strong>${item.idx}. ${item.title}</strong>`;

                const rationale = document.createElement('p');
                rationale.className = 'evidence-rationale';
                rationale.innerHTML = `<strong>Rationale:</strong> ${item.rationale}`;

                const verdict = document.createElement('p');
                verdict.innerHTML = `<strong style="color: black;">Verdict:</strong> <span class="support-label" style="text-transform: uppercase;font-weight: bold;">${String(item.label).toUpperCase()}</span>`;
                
                const link = document.createElement('a');
                link.className = 'read-more';
                link.href = item.link;
                link.target = '_blank';
                link.textContent = 'Read more';
                div.appendChild(title);
                div.appendChild(verdict);
                div.appendChild(rationale);
                div.appendChild(link);
                explanationContainer.appendChild(div);
            }
        });
    
    
    } else {
        alert(data.error);  // Show error if no explanation was found
    }
})
        .catch(error => {
            console.error('Error during explanation:', error);
            alert('Error while fetching explanation. Please try again.');
        });
    });
});

function escapeHTML(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

/*
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM fully loaded and parsed');

    const detectButton = document.getElementById('detectButton');
    if (!detectButton) {
        console.error('detectButton not found in the DOM');
        return;
    }

    detectButton.addEventListener('click', function () {
        console.log('Detect button clicked');
        const newsText = document.getElementById('newsInput').value;
        console.log('News input text:', newsText);
        sendTextForDetection(newsText);
    });
});


function sendTextForDetection(text) {
        if (text.length > 0) {
            const resultElement = document.getElementById('result');
            resultElement.innerText = 'Analyzing...';
    
            fetch('http://localhost:5000/detect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: text }),
            })
            .then(response => {
                console.log('Response received:', response);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Response data:', data);
                resultElement.innerText =
                    data.fake_news_probability > 0.5
                        ? 'This article is likely fake.'
                        : 'This article is likely real.';
            })
            .catch(error => {
                console.error('Fetch error:', error);
                resultElement.innerText = 'Error detecting fake news. Please try again.';
            });
        } else {
            const resultElement = document.getElementById('result');
            resultElement.innerText = 'Please enter some text to analyze.';
        }
}
*/

document.addEventListener('DOMContentLoaded', function() {
    const learningSection = document.getElementById('learning-section');
    const factChecksContainer = document.getElementById('fact-check-list'); // Updated for the UL element
    const nextButton = document.getElementById('next-button');
    const prevButton = document.getElementById('prev-button');

    let currentFactCheckIndex = 0; // To track the current fact-check being displayed
    let factChecksData = [];

    console.log('Fetching fact-checks from server...');
    fetch('http://localhost:5000/fetch-fact-checks')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log("Fetched fact-checks:", data);
            factChecksData = data;

            // Show learning section if data is available
            if (factChecksData && Array.isArray(factChecksData) && factChecksData.length > 0) {
                learningSection.classList.remove('hidden');

                // Function to display the current fact-check
                function displayFactCheck(index) {
                    // Clear any previously displayed fact-check
                    factChecksContainer.innerHTML = '';
                    const item = factChecksData[index];

                    // Create the fact-check content
                    const factCheckCard = document.createElement('li');
                    factCheckCard.classList.add('fact-check');
                    factCheckCard.innerHTML = `
                        <div class="fact-check-content">
                            <h3 class="claim">${item['Claim']}</h3>
                            <p class="verdict"><strong>Verdict:</strong> ${item['Verdict']}</p>
                            <a href="${item['Source URL']}" target="_blank" class="read-more">Read More</a>
                        </div>
                    `;

                    // Append the new fact-check card to the container
                    factChecksContainer.appendChild(factCheckCard);
                }

                // Display the first fact-check initially
                displayFactCheck(currentFactCheckIndex);

                // Handle the "Next" button click event
                nextButton.addEventListener('click', function() {
                    currentFactCheckIndex++;
                    if (currentFactCheckIndex >= factChecksData.length) {
                        currentFactCheckIndex = 0; // Loop back to the first fact-check when reaching the end
                    }
                    displayFactCheck(currentFactCheckIndex);
                });

                // Handle the "Previous" button click event
                prevButton.addEventListener('click', function() {
                    currentFactCheckIndex--;
                    if (currentFactCheckIndex < 0) {
                        currentFactCheckIndex = factChecksData.length - 1; // Go to the last fact-check when reaching the beginning
                    }
                    displayFactCheck(currentFactCheckIndex);
                });

            } else {
                console.log("No fact-checks available.");
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
});



  