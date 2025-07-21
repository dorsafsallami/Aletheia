import csv
import json
import secrets
import time

import psycopg2
import torch
from flask import Flask, g, jsonify, request, session
from flask_cors import CORS
from transformers import BertForSequenceClassification, BertTokenizer

from factcheckexplorer import FactCheckLib
from rag import generate_explanation, process_content

app = Flask(__name__)
CORS(app)
# Set a secret key for your application (used to sign session cookies)
app.secret_key = secrets.token_hex(16)  # You can also hardcode this, but it's recommended to use a random key

# ******************************************************** Detection ***************************************************************

@app.route('/detect', methods=['POST'])
def detect_fake_news():
    try:
        data = request.json
        text = data.get('text')

        # Call the process_content function
        #decision_result, explanation = process_content(text)
        print("Waiting for 60 seconds...")
        time.sleep(20)
        print("Done waiting!")
        decision_result =  {'confidence': 90, 'decision': 'fake'}
        explanation =[{'type': 'label', 'label': 'fake', 'confidence': 90}, {'type': 'intro', 'content': 'The following evidence was considered for this classification:'}, {'type': 'evidence', 'idx': 1, 'title': "Oregon Fire Trucks Fighting L.A. Blazes Didn't Require 'Emissions ...", 'label': 'contradict', 'rationale': 'The title of the search result indicates that the Oregon fire trucks did not require emissions testing, contradicting the claim that they were held in Sacramento for emissions testing.', 'link': 'https://www.factcheck.org/2025/01/oregon-fire-trucks-fighting-l-a-blazes-didnt-require-emissions-testing/'}, {'type': 'evidence', 'idx': 2, 'title': 'Were LA-bound firefighters held up in Sacramento? California ...', 'label': 'support', 'rationale': "The search result directly quotes the claim stating that Oregon sent 60 fire trucks to California to help with the fires, but they're being held in Sacramento for emissions testing.", 'link': 'https://www.sacbee.com/news/politics-government/capitol-alert/article298659843.html'}, {'type': 'evidence', 'idx': 3, 'title': 'Adam Carolla on X: "This can\'t be true" / X', 'label': 'support', 'rationale': "The search result directly quotes the claim stating that Oregon sent 60 fire trucks to California to help with the fires, but they're being held in Sacramento for emissions testing.", 'link': 'https://x.com/adamcarolla/status/1878268612089376977'}, {'type': 'evidence', 'idx': 4, 'title': 'Rumors of Oregon firetrucks turned away in Sacramento false ...', 'label': 'contradict', 'rationale': 'The search result clearly dispels the rumor that Oregon firetrucks were held in Sacramento for emissions testing. While it does not mention the number of fire trucks sent from Oregon to California, it directly contradicts the claim that they were held for emissions testing.', 'link': 'https://www.kcra.com/article/rumors-oregon-fire-trucks-stopped-sacramento/63436495'}, {'type': 'evidence', 'idx': 5, 'title': 'Out of state fire trucks undergoing vehicle inspections? - Questions ...', 'label': 'support', 'rationale': 'The search result states that 60 engines from Oregon have been detained in Sacramento for emissions testing, which aligns with the claim that Oregon sent 60 fire trucks to California and they are being held in Sacramento for emissions testing.', 'link': 'https://forums.wildfireintel.org/t/out-of-state-fire-trucks-undergoing-vehicle-inspections/28166?page=2'}, {'type': 'evidence', 'idx': 6, 'title': 'Amid L.A. fires, California officials deny false claims Oregon fire ...', 'label': 'contradict', 'rationale': 'The search result states that California officials denied the claims that Oregon fire trucks were turned away due to emissions regulations, which contradicts the claim that Oregon fire trucks were held in Sacramento for emissions testing.', 'link': 'https://www.cbsnews.com/news/la-fires-california-false-claim-oregon-fire-trucks-turned-away/'}, {'type': 'evidence', 'idx': 7, 'title': 'No, California is not stopping Oregon fire trucks for emissions testing ...', 'label': 'contradict', 'rationale': 'The search result explicitly states that California is not stopping Oregon fire trucks for emissions testing, which contradicts the claim that Oregon fire trucks are being held in Sacramento for emissions testing.', 'link': 'https://www.kptv.com/2025/01/12/no-california-is-not-stopping-oregon-fire-trucks-emissions-testing-officials-say/'}, {'type': 'evidence', 'idx': 8, 'title': 'Social media rumors about CA emission testing out-of-state fire ...', 'label': 'contradict', 'rationale': 'The search result states that out-of-state fire trucks, which could include those from Oregon, were inspected in California, but not for emissions. This contradicts the claim that the fire trucks were being held for emissions testing.', 'link': 'https://www.abc10.com/article/news/local/wildfire/social-media-rumors-cal-fire-fire-trucks/103-f73a84a6-f36f-4ab3-a1f5-a8176957dbd7'}, {'type': 'evidence', 'idx': 9, 'title': "Fact Check: No, California Didn't Turn Away Fire Trucks From ...", 'label': 'contradict', 'rationale': 'The search result contradicts the claim. The title of the article clearly states that California did not turn away fire trucks from Oregon for emissions testing.', 'link': 'https://www.yahoo.com/news/fact-check-no-california-didnt-202800475.html'}]
        # Ensure that decision_result and explanation are returned correctly
        if not decision_result or not explanation:
            raise ValueError("The decision or explanation was not returned correctly from process_content.")
        
        # Store in session
        session['decision_result'] = decision_result
        session['explanation'] = explanation

        # Log session contents
        print(f"Session data: {session}")

        # Extract decision and confidence
        decision = decision_result["decision"]
        confidence = decision_result["confidence"]

        return jsonify({'result': decision, 'confidence': confidence, 'explanation': explanation})

    except Exception as e:
        app.logger.error(f"Server error: {str(e)}")
        return jsonify({'error': str(e)}), 500




@app.route('/explanation', methods=['POST'])
def get_explanation():
    try:
        # Check if the explanation is already stored in the session
        if 'explanation' in session:
            # Return the explanation from the session
            explanation_data = session['explanation']

            # If the explanation is stored as a structured list of components, 
            # you can return it as JSON for easy rendering in the front-end
            #print(jsonify({'explanation': explanation_data}))
            return jsonify({'explanation': explanation_data})

        # If no explanation is found in the session
        return jsonify({'error': 'No result found. Please process the text first.'}), 400

    except Exception as e:
        # Log and return any unexpected errors
        app.logger.error(f"Server error: {str(e)}")
        return jsonify({'error': str(e)}), 500


# ********************************************** Community ****************************************************************


# Database connection
conn = psycopg2.connect(
    dbname="mydb",
    user="postgres",
    password="your_password_here",
    host="localhost",
    port="5432"
)
conn.autocommit = True

# --------------------
# GET /posts
# --------------------
@app.route('/posts', methods=['GET'])
def get_posts():
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM posts;")
            rows = cur.fetchall()
            colnames = [desc[0] for desc in cur.description]
            posts = [dict(zip(colnames, row)) for row in rows]
            return jsonify(posts)
    except Exception as e:
        print(f"Error in get_posts: {e}")
        return jsonify({"error": "Internal server error"}), 500

# --------------------
# POST /posts
# --------------------
@app.route('/posts', methods=['POST'])
def create_post():
    try:
        data = request.json
        if not data or 'content' not in data:
            return jsonify({'error': 'Invalid data'}), 400

        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO posts (content, upvotes, downvotes, comments, verification_status, badge)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING *;
            """, (
                data['content'],
                0,
                0,
                json.dumps([]),
                data.get('verification_status', 'pending'),
                data.get('badge', '')
            ))
            new_post = cur.fetchone()
            colnames = [desc[0] for desc in cur.description]
            return jsonify(dict(zip(colnames, new_post))), 201
    except Exception as e:
        print(f"Error creating post: {e}")
        return jsonify({'error': 'Failed to create post'}), 500

# --------------------
# POST /posts/<post_id>/comments
# --------------------
@app.route('/posts/<post_id>/comments', methods=['POST'])
def add_comment(post_id):
    data = request.json
    comment = data.get('comment', '').strip()
    if not comment:
        return jsonify({'error': 'Comment cannot be empty'}), 400

    try:
        with conn.cursor() as cur:
            cur.execute("SELECT comments FROM posts WHERE id = %s;", (post_id,))
            row = cur.fetchone()
            if not row:
                return jsonify({'error': 'Post not found'}), 404

            comments = row[0] or []
            comments.append(comment)

            cur.execute("UPDATE posts SET comments = %s WHERE id = %s RETURNING *;", (json.dumps(comments), post_id))
            updated_post = cur.fetchone()
            colnames = [desc[0] for desc in cur.description]
            return jsonify(dict(zip(colnames, updated_post))), 201
    except Exception as e:
        print(f"Error adding comment: {e}")
        return jsonify({'error': 'Failed to add comment'}), 500

# --------------------
# POST /posts/<post_id>/vote
# --------------------
@app.route('/posts/<post_id>/vote', methods=['POST'])
def vote_post(post_id):
    try:
        data = request.json
        if data['vote'] not in ['upvote', 'downvote']:
            return jsonify({'error': 'Invalid vote type'}), 400

        vote_column = 'upvotes' if data['vote'] == 'upvote' else 'downvotes'
        with conn.cursor() as cur:
            cur.execute(f"""
                UPDATE posts
                SET {vote_column} = {vote_column} + 1
                WHERE id = %s
                RETURNING *;
            """, (post_id,))
            updated_post = cur.fetchone()
            if not updated_post:
                return jsonify({'error': 'Post not found'}), 404
            colnames = [desc[0] for desc in cur.description]
            return jsonify(dict(zip(colnames, updated_post))), 200
    except Exception as e:
        print(f"Error voting on post: {e}")
        return jsonify({'error': 'Failed to vote'}), 500

# ******************************************************** Google API ***************************************************************

@app.route('/fetch-fact-checks', methods=['GET'])
def get_fact_checks():
    fact_check_lib = FactCheckLib(query="all", language="en", num_results=100)
    fact_checks = fact_check_lib.process()
    
    # Ensure that fact_checks is a list of dictionaries with expected keys
    if not isinstance(fact_checks, list):
        return jsonify({"error": "Unexpected response format from FactCheckLib"}), 500
    
    # Check structure of fact_checks before returning
    for fact_check in fact_checks:
        if not all(key in fact_check for key in ['Source URL', 'Claim', 'Verdict', 'Review Publication Date']):
            return jsonify({"error": "Missing expected fields in fact check data"}), 500
    
    return jsonify(fact_checks)


if __name__ == '__main__':
    app.run(debug=True)
