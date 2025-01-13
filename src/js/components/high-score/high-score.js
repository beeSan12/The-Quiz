/**
 * The high-score web component module.
 *
 * @author // Beatriz Sanssi <bs222eh@student.lnu.se>
 * @version 1.1.0
 */

// Define template.
const template = document.createElement('template')
template.innerHTML = `
<style>
  #score {
    font-family: 'NT Adventure';
    font-size: 40px;
    font-weight: bold;
    text-align: center;
    justify-self: center;
    padding: 20px;
    margin: 20px;
    max-width: 200px;
  }

  #highscore-box {
    font-family: 'NT Adventure';
    font-size: 40px;
    font-weight: bold;
    padding: 10px;
    margin: 10px;
    max-width: 250px;
    list-style-type: none;
    display: block;
  }

  #highscore-box p {
    text-align: center;
  }

  #highscore-list li {
    list-style-type: none;
    justify-content: left;
    padding-left: 0;
    margin-left: 0;
  }

  #highscore-list {
    justify-content: center;
    padding-left: 0;
    margin-left: 0;
  }

  #high-score {
    background-color: white;
    border: 3px solid rgb(76, 99, 76);
    margin: 20px;
    padding: 20px;
  }

  #retry {
    background-color: rgb(76, 99, 76);
    color: white;
    font-family: 'NT Adventure';
    position: relative;
    font-size: 20px;
    left: 55px;
    font-weight: bold;
    padding: 10px;
    margin: 10px;
    max-width: 100px;
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  }

</style>
<div id="high-score">
  <div id="score">
    <p> Your score : </p>
    <hr>
    <span id="current-score"></span>
  </div>
  <div id="highscore-box">
    <p> Highscore : </p>
    <hr>
    <ul id="highscore-list">
    </ul>
    <button type="button" id="retry">Try again</button>
  </div>
</div>
`

customElements.define('high-score',
  /**
   * Represents a high-score element.
   */
  class extends HTMLElement {
    #currentScore
    /**
     * The list of highscores element.
     *
     * @type {HTMLUListElement}
     */
    #highscoreList

    /**
     * The retry button element.
     *
     * @type {HTMLButtonElement}
     */
    #retry

    /**
     * The high-score div element.
     *
     * @type {HTMLDivElement}
     */
    #highScore

    /**
     * The high-score box element.
     *
     * @type {HTMLDivElement}
     */
    #highscoreBox

    /**
     * The score element.
     *
     * @type {HTMLDivElement}
     */
    #score

    /**
     * Creates an instance of the current type.
     */
    constructor () {
      super()

      // Attach a shadow DOM tree to this element and
      // append the template to the shadow root.
      this.attachShadow({ mode: 'open' })
        .appendChild(template.content.cloneNode(true))

      // Get the score element in the shadow root.
      this.#score = this.shadowRoot.getElementById('current-score')

      // Get the score element in the shadow root.
      this.#highscoreBox = this.shadowRoot.getElementById('highscore-box')

      // Get the highscore list element in the shadow root.
      this.#highscoreList = this.shadowRoot.getElementById('highscore-list')

      // Get the highscore element in the shadow root.
      this.#highScore = this.shadowRoot.getElementById('highscore')

      // Get the current score element in the shadow root.
      this.#currentScore = this.shadowRoot.getElementById('current-score')

      // Get the retry button element in the shadow root.
      this.#retry = this.shadowRoot.getElementById('retry')

      // Add an event listener to the score element.
      this.#score.addEventListener('score', (event) => this.displayScore(event.detail.score))

      // Add an event listener to the retry button.
      this.#retry.addEventListener('click', (event) => this.displayHighscore())
    }

    /**
     * Called after the element is inserted into the DOM.
     */
    async connectedCallback () {
      this.clearScore()
      this.highscores = JSON.parse(localStorage.getItem('highscores')) || []
      const score = JSON.parse(this.getAttribute('elapsedSeconds'))
      if (score !== null) {
        console.log('Score:', score)
        await this.updateHighScore(score)
      }
    }

    /**
     * Clear the score.
     */
    clearScore () {
      this.#score.textContent = ''
      this.#currentScore.textContent = ''
    }

    /**
     * Calculate the score.
     *
     * @returns {number} The score.
     */
    calculateScore () {
      let score = 0
      const elapsedSecondsArray = JSON.parse(localStorage.getItem('elapsedSecondsPerQuestion')) || []

      for (const seconds of elapsedSecondsArray) {
        score += parseInt(seconds)
      }
      console.log('Calculated score:', score)
      localStorage.setItem('score', JSON.stringify(score))
      return score
    }

    /**
     * Set the current score.
     *
     * @param {number} score - The current score.
     */
    setCurrentScore (score) {
      this.#currentScore.textContent = score
    }

    /**
     * Display the current score.
     *
     * @param {number} score - The current score.
     */
    displayScore (score) {
      console.log('Displaying score:', score)
      this.#currentScore.textContent = `${score}`
    }

    /**
     * Update the highscore.
     *
     * @param {string} nickname - The nickname data.
     * @param {number} score - The score data.
     */
    updateHighScore (nickname, score) {
      console.log('Attempting to update high score with Nickname:', nickname, 'Score: ', score)
      const parsedScore = parseInt(score, 10)

      // Ensure the nickname and score are valid.
      if (typeof nickname !== 'string' || isNaN(parsedScore)) {
        console.error('Invalid score data. Nickname:', nickname, 'Score: ', score)
        return
      }

      // Get the latest highscores from localStorage or as an empty array if none exist.
      let highscores = JSON.parse(localStorage.getItem('highscores')) || []
      console.log('Current highscores:', highscores)

      highscores.sort((a, b) => a.score - b.score)

      // Add the new score if it's better than the lowest score or if there are fewer than 5 highscores.
      if (highscores.length < 5 || parsedScore < highscores[4]?.score) {
        highscores.push({ nickname, score: parsedScore })

        highscores.sort((a, b) => a.score - b.score)

        // Keep only the top 5 highscores.
        highscores = highscores.slice(0, 5)

        localStorage.setItem('highscores', JSON.stringify(highscores))
        console.log('Updated highscores:', highscores)
      } else {
        console.log('New score did not make it into the high scores list.')
      }
      // Display the updated high scores
      this.displayHighscore()
    }

    /**
     * Display the highscore.
     */
    displayHighscore () {
      this.highscores = JSON.parse(localStorage.getItem('highscores')) || []
      if (!this.#highscoreList) {
        console.error('#highscoreList element not found')
        return
      }
      // Clear the highscore list.
      this.#highscoreList.innerHTML = ''

      // Add each highscore to the highscore list.
      this.highscores.forEach((highScore, index) => {
        if (highScore.nickname && highScore.score !== undefined) {
          const listItem = document.createElement('li')
          listItem.textContent = `${index + 1}. ${highScore.nickname}: ${highScore.score}`
          this.#highscoreList.appendChild(listItem)
        }
      })
    }
  })
