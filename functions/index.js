const admin = require('firebase-admin');
admin.initializeApp();
const functions = require("firebase-functions");
const RAPIDAPI_KEY = functions.config().wordsapi.key;

const db = admin.firestore(); // Correctly gets the Firestore instance for Admin SDK

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchAndFormatRandomWord() {
    console.log('calling fetch and format rnd word')
    const MAX_RETRIES = 5;
    let retryCount = 0;
    let currentDelay = 1000;
    while (retryCount < MAX_RETRIES) {
        try {
            console.log(`Attempt ${retryCount + 1}: Function firing to get a random word!`);
            const response = await fetch('https://wordsapiv1.p.rapidapi.com/words/?letterPattern=^[a-zA-Z]*$&random=true',
                {
                    method: 'GET',
                    headers: {
                        'X-RapidAPI-Key': RAPIDAPI_KEY,
                        'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
                    }
                });
            if (!response.ok) {
                console.error(`API Error: ${response.status} ${response.statusText}`);
                throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
            }

            const wordData = await response.json();

            if (wordData.results == undefined || wordData.results.length === 0) {
                console.log("No valid results found for word, retrying...");
                retryCount++;
                if (retryCount < MAX_RETRIES) {
                    await delay(currentDelay);
                    currentDelay *= 2;
                    continue;
                } else {
                    console.error("Max retries reached for empty results.");
                    return null;
                }
            }
            console.log(wordData)
            const definitions = [];
            wordData.results.forEach((definition) => {
                if (definition.definition) {
                    definitions.push(definition.definition);
                }
            });
            console.log("word data freq" + wordData.frequency)
            const formattedDefinitions = {
                definition1: definitions[0] || 'No definition found',
                definition2: definitions[1] || 'No definition found',
                definition3: definitions[2] || 'No definition found'
            };
            // console.log(wordData)
            return {
                word: wordData.word,
                ...formattedDefinitions,
                frequency: wordData.frequency || 0
            };

        } catch (error) { // Catch any errors, including those we throw
            console.error(`Error fetching or processing random word (Attempt ${retryCount + 1}):`, error.message);

            // Check if it's an error that might resolve with a retry (e.g., network error, or an HTTP error we explicitly threw)
            // If you want to differentiate, you could check for error.message.includes('HTTP Error: 429')
            // For now, any error in the try block will trigger a retry
            retryCount++;
            if (retryCount < MAX_RETRIES) {
                console.log(`Retrying in ${currentDelay}ms...`);
                await delay(currentDelay); // Use our simple delay helper
                currentDelay *= 2; // Exponential backoff
                continue; // Continue to the next iteration of the loop
            } else {
                console.error("Max retries reached. Giving up.");
                return null; // All retries failed
            }
        }
    }
    return null; // Should not be reached in normal flow
}

async function fetchManyRandomWords() {
    console.log('attempting new function');
    try {
        let result = []; // We can push the formatted objects directly here
        const numberOfCalls = 10;

        for (let i = 0; i < numberOfCalls; i++) {
            const wordData = await fetchAndFormatRandomWord();
            console.log('returned to many fetch func')
            // Check if wordData exists and has the necessary attributes
            if (wordData && wordData.word) {
                result.push({
                    word: wordData.word,
                    definition1: wordData.definition1 || 'No definition found',
                    definition2: wordData.definition2 || 'No definition found',
                    definition3: wordData.definition3 || 'No definition found',
                    frequency: wordData.frequency || 0
                });
                result.sort((a, b) => b.frequency - a.frequency);
                result = result.filter(obj => obj.frequency !== 0);
            } else {
                console.warn(`Failed to fetch a word on attempt ${i + 1}.`);
            }
        }

        return result;

    } catch (error) {
        console.error("Error in fetchManyRandomWords:", error);
    }
}

exports.fetchWordDefinitionFromAPI = functions.https.onCall(async (data) => {
    // Expected input from the client: 'definatom'
    const definatom = data.definatom;
    console.log(definatom.definatom)
    // if (!definatom || typeof definatom !== 'string') {
    //     throw new functions.https.HttpsError(
    //         'invalid-argument',
    //         'The "definatom" parameter must be a non-empty string.'
    //     );
    // }

    const MAX_RETRIES = 3; // Or whatever you prefer
    let retryCount = 0;
    let currentDelay = 1000; // 1 second

    // Keep the cleaning logic here, as the Cloud Function processes the input
    const cleanDefinatom = definatom.replace(/\W/g, '');

    while (retryCount < MAX_RETRIES) {
        try {
            console.log(`Cloud Function attempting definition for: ${cleanDefinatom} (Attempt ${retryCount + 1})`);

            // Use native fetch (Node.js 18+) or axios if preferred
            const response = await fetch(`https://wordsapiv1.p.rapidapi.com/words/${cleanDefinatom}/`,
                {
                    method: 'GET',
                    headers: {
                        'X-RapidAPI-Key': RAPIDAPI_KEY, // This key is now secure!
                        'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
                    }
                });

            if (!response.ok) {
                // If the API returns an error, log it and throw an HttpsError
                const errorText = await response.text();
                console.error(`API Error from WordsAPI for ${cleanDefinatom}: ${response.status} ${response.statusText} - ${errorText}`);
                throw new functions.https.HttpsError(
                    'unavailable', // Or 'not-found' if it's a 404, 'internal' for 5xx
                    `Failed to get definition from external API: ${response.status} ${response.statusText}`
                );
            }

            const wordData = await response.json(); // If using axios: response.data
            // console.log("Raw word data received in Cloud Function:", wordData);

            // Your original logic for handling empty results
            if (wordData.results === undefined || wordData.results.length === 0) {
                // The API might return 200 OK but no definitions for the word
                console.log(`No definitions found for ${cleanDefinatom} on this attempt.`);
                // If you want to retry specific HTTP status codes, add that logic here.
                // For now, if no definitions, we can return an empty definitions array
                // or retry if it's a transient issue. For simplicity here, we'll return
                // empty if the API explicitly says no results, but retry on connection issues.
                return { word: cleanDefinatom, definitions: [], frequency: null };
            }

            const definitions = [];
            wordData.results.forEach((definition) => { // Use 'any' or define a specific type for definition
                if (definition.definition) {
                    definitions.push(definition.definition);
                }
            });

            // Return the processed data to the client
            return {
                word: cleanDefinatom,
                definitions: definitions.slice(0, 3), // Limit to 3 definitions as you do client-side
                frequency: wordData.frequency || null // Ensure frequency is included
            };

        } catch (error) {
            console.error(`Error in fetchWordDefinitionFromAPI for ${cleanDefinatom} (Attempt ${retryCount + 1}):`, error.message);

            // If it's an HttpsError we explicitly threw, rethrow it to propagate
            if (error instanceof functions.https.HttpsError) {
                throw error;
            }

            // For other unexpected errors (e.g., network issues), retry
            retryCount++;
            if (retryCount < MAX_RETRIES) {
                console.log(`Retrying fetch for ${cleanDefinatom} in ${currentDelay}ms...`);
                await delay(currentDelay);
                currentDelay *= 2;
                continue;
            } else {
                console.error(`Max retries reached for ${cleanDefinatom}. Giving up.`);
                throw new functions.https.HttpsError(
                    'internal',
                    `Failed to fetch definition for '${cleanDefinatom}' after multiple attempts.`
                );
            }
        }
    }
    // This part should technically not be reached if MAX_RETRIES results in an error throw
    throw new functions.https.HttpsError('internal', 'Unexpected function termination.');
});

// === UPDATE YOUR SCHEDULED CLOUD FUNCTION ===
exports.updateSpecificWord = functions.pubsub.schedule('31 20 * * *')
    .timeZone("America/New_York")
    .onRun(async () => {
        let words = await fetchManyRandomWords();
        console.log(words)
        try {
            // Call your new function for testing an alternative
            const wordDocRef1 = db.collection('wordsDujoir').doc('word1');
            const wordDocRef2 = db.collection('wordsDujoir').doc('word2');
            console.log('attempting to set word1')
            await wordDocRef1.set(words[0]);
            console.log('attempting to set word2')
            await wordDocRef2.set(words[1])
            // await fetchAndFormatRandomWord2(); // Replace with your actual function name
            console.log('Successfully ran test function!!');
        } catch (error) {
            console.error("Error in yourAlternativeFunction:", error);
            // This will ensure the scheduler still sees a successful run for this specific function,
            // preventing retries for just this part.
            return null;
        }
        console.log('Scheduled function finished running.');
        return null; // Important: Return null for success in Cloud Functions
    });

// /**
//  * Cloud Function to securely update a user's score and the global daily best score.
//  * This function should be called by authenticated users only.
//  *
//  * @param {object} data - The data sent from the client.
//  *   @param {string} data.displayName - The user's display name.
//  *   @param {number} data.totalLinks - The user's score (e.g., number of links).
//  *   @param {number} data.avgFreqScore - The user's average frequency score.
//  * @param {functions.https.CallableContext} context - The context of the call,
//  *   including authentication information.
//  * @returns {Promise<object>} An object indicating success and relevant flags.
//  */
// exports.updateUserScore = functions.https.onCall(async (data, context) => {
//     // 1. **Authentication:** Ensure only authenticated users can call this function.
//     if (!context.auth) {
//         console.warn("Attempt to call updateUserScore by unauthenticated user.");
//         throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
//     }
//     const userId = context.auth.uid;
//     // It's generally more secure to get displayName from the auth token if available,
//     // or your user profile database. We'll prioritize the client-sent displayName,
//     // but be mindful if this needs stricter validation for trust.
//     const userDisplayName = data.displayName || context.auth.token?.name || 'Anonymous Player';
//     const userTotalLinks = data.totalLinks;
//     const userAvgFreqScore = data.avgFreqScore;

//     // 2. **Input Validation:** Ensure the data from the client is valid.
//     if (typeof userTotalLinks !== 'number' || userTotalLinks < 0 ||
//         typeof userAvgFreqScore !== 'number' || userAvgFreqScore < 0) {
//         console.warn(`Invalid score data received for user ${userId}:`, data);
//         throw new functions.https.HttpsError('invalid-argument', 'Invalid score data provided. totalLinks and avgFreqScore must be non-negative numbers.');
//     }

//     // Flags to return to the client
//     let firstWinToday = false; // Is this the first score recorded for the day?
//     let newDailyBestAchieved = false; // Did this score beat the global daily best?
//     let personalBestUpdated = false; // Was the user's personal best updated?

//     try {
//         // 3. **Firestore Transaction:** Use a transaction to ensure atomicity.
//         // This is critical for reading a global score and then conditionally updating it,
//         // especially if multiple users might submit scores concurrently.
//         await db.runTransaction(async (transaction) => {

//             const globalScoreDocRef = db.collection('scores').doc(userDisplayName); // Document for daily global best
//             const userPersonalScoreDocRef = db.collection('highScore').doc(userDisplayName); // Document for user's personal best

//             // Fetch current global and personal scores within the transaction
//             const globalScoreSnap = await transaction.get(globalScoreDocRef);
//             const userPersonalScoreSnap = await transaction.get(userPersonalScoreDocRef);

//             let currentDailyBestLinks = 0
//             let currentUserPersonalBestLinks = 0

//             // Determine the current global daily best
//             if (globalScoreSnap.exists) {
//                 const globalData = globalScoreSnap.data();
//                 if (globalData && typeof globalData.totalLinks === 'number') {
//                     currentDailyBestLinks = globalData.totalLinks;
//                 }
//             }

//             // Determine the user's current personal best
//             if (userPersonalScoreSnap.exists) {
//                 const personalData = userPersonalScoreSnap.data();
//                 if (personalData && typeof personalData.totalLinks === 'number') {
//                     currentUserPersonalBestLinks = personalData.totalLinks;
//                 }
//             }

//             // **Logic for updating Global Daily Best Score**
//             // If the user's score is better than the current daily best, or if it's the first score for the day (currentDailyBestLinks is Infinity/0)
//             if (userTotalLinks < currentDailyBestLinks || currentDailyBestLinks === Infinity || currentDailyBestLinks === 0) {
//                 if (currentDailyBestLinks === Infinity || currentDailyBestLinks === 0) {
//                     firstWinToday = true; // This user is the first to set a score for the day
//                 } else {
//                     newDailyBestAchieved = true; // This user beat the previous daily best
//                 }

//                 // Update the global daily best document
//                 transaction.set(globalScoreDocRef, {
//                     totalLinks: userTotalLinks,
//                     uid: userId,
//                     avgFreqScore: userAvgFreqScore,
//                     displayName: userDisplayName,
//                     timestamp: admin.firestore.FieldValue.serverTimestamp() // Use server timestamp for consistency
//                 });
//             }

//             // **Logic for updating User's Personal Best Score**
//             // Update the user's personal best ONLY if their current score is better than their previous personal best.
//             if (userTotalLinks < currentUserPersonalBestLinks) {
//                 transaction.set(userPersonalScoreDocRef, {
//                     displayName: userDisplayName,
//                     totalLinks: userTotalLinks,
//                     avgFreqScore: userAvgFreqScore,
//                     lastUpdated: admin.firestore.FieldValue.serverTimestamp()
//                 });
//                 personalBestUpdated = true;
//             }
//             // If the user's score is not better than the current daily best AND not better than their own personal best,
//             // then no updates will occur.

//             // The transaction automatically commits if no errors occurred.
//         });

//         // 4. **Return Results to Client:**
//         let message = `Score processed. Not a new daily or personal best.`;
//         if (firstWinToday) {
//             message = `You're the first to clear the game today! Total Links: ${userTotalLinks}`;
//         } else if (newDailyBestAchieved) {
//             message = `New daily best score recorded: ${userTotalLinks}`;
//         } else if (personalBestUpdated) {
//             message = `Your personal best updated: ${userTotalLinks}`;
//         }

//         return {
//             success: true,
//             firstWin: firstWinToday,
//             newDailyBest: newDailyBestAchieved,
//             personalBestUpdated: personalBestUpdated,
//             message: message
//         };

//     } catch (error) { // Catch any errors during the function execution
//         console.error("Error in updateUserScore Cloud Function: ", error);
//         // Rethrow as an HttpsError so the client gets a meaningful error
//         if (error instanceof functions.https.HttpsError) {
//             throw error;
//         }
//         throw new functions.https.HttpsError('internal', 'An unexpected error occurred while processing your score.', error.message);
//     }
// });
