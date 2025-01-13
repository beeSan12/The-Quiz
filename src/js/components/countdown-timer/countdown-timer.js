/**
 * The countdown-timer web component module.
 *
 * @author // Beatriz Sanssi <bs222eh@student.lnu.se>
 * @version 1.1.0
 */

// Define template.
const template = document.createElement('template')
template.innerHTML = `
<style>
  #countdown-timer {
  font-family: 'NT Adventure';
  margin: 20px;
  padding: 20px;
  background-color: white;
  color: rgb(76, 99, 76);
  border: 3px solid rgb(76, 99, 76);
  justify-content: space-evenly;
}

#timer {
  font-size: 40px;
  font-weight: bold;
  text-align: center; 
  justify-self: center;
  padding: 10px;
}

#timer-limit {
  font-size: 40px;
  font-weight: bold;
  text-align: center;
  justify-self: center;
  padding: 10px;
}

#timer p,
#timer-limit p {
  font-size: 30px;
  font-weight: bold;
  color: rgb(76, 99, 76);
  margin: 10px;
}
</style>

<div id="countdown-timer">
  <div id="timer">
    <p>Time remaining: <span id="timer-seconds"></span> seconds</p>
  </div>
  <div id="timer-limit">
    <p>Time remaining: <span id="limit-seconds"></span> seconds</p>
  </div>
</div>
`

customElements.define('countdown-timer',
  /**
   * Represents a countdown-timer element.
   */
  class extends HTMLElement {
    /**
     * The countdown timer div element.
     *
     * @type {HTMLDivElement}
     */
    #countdownTimer

    /**
     * The timer div element.
     *
     * @type {HTMLDivElement}
     */
    #timer

    /**
     * The timer limit div element.
     *
     * @type {HTMLDivElement}
     */
    #timerLimit

    #limitSeconds
    #timerSeconds
    #timerInterval
    #elapsedSeconds
    #startTime

    elapsedSecondsArray = []

    /**
     * Creates an instance of the current type.
     */
    constructor () {
      super()

      // Get the countdown-timer element in the shadow root.
      this.attachShadow({ mode: 'open' })
        .appendChild(template.content.cloneNode(true))

      // Get the countdown-timer element in the shadow root.
      this.#countdownTimer = this.shadowRoot.getElementById('countdown-timer')

      // Get the countdown-timer element in the shadow root.
      this.#timer = this.shadowRoot.getElementById('timer')

      // Get the timer-limit element in the shadow root.
      this.#timerLimit = this.shadowRoot.getElementById('timer-limit')

      // Get the timer-seconds element in the shadow root.
      this.#timerSeconds = this.shadowRoot.getElementById('timer-seconds')

      // Get the limit-seconds element in the shadow root.
      this.#limitSeconds = this.shadowRoot.getElementById('limit-seconds')

      // Get the remaining seconds element in the shadow root.
      this.elapsedSeconds = this.shadowRoot.querySelector('elapsed-seconds')
    }

    /**
     * Called after the element is inserted into the DOM.
     */
    async connectedCallback () {
      clearInterval(this.#timerInterval)
      localStorage.removeItem('elapsedSecondsPerQuestion')
      localStorage.removeItem('remainingSeconds')
      localStorage.removeItem('elapsedSecondsArray')

      const question = JSON.parse(this.getAttribute('question'))
      const limit = JSON.parse(this.getAttribute('limit'))
      if (question && question.limit !== null) {
        console.log('Question:', question, 'Limit:', limit)
        console.log('Limit', limit)

        await this.startTimer(question)
        console.log('timer started!')
      }
    }

    /**
     * Clears the timer.
     *
     * @param {object} question - The question object.
     */
    clearCountdownTimer (question) {
      clearInterval(this.#timerInterval)
      this.#timerInterval = null
      this.clearTimer(question)
      this.clearTimerLimit(question)
      this.#timer.value = ''
      this.#timerLimit.value = ''
      this.#timerSeconds.textContent = ''
      this.#limitSeconds.textContent = ''
      this.#startTime = null
    }

    /**
     * Starts the timer.
     *
     * @param {object} question - The question objekt.
     */
    startTimer (question) {
      console.log('Starting timer with question:', question)
      if (!question) {
        console.error('question is undefined')
        return
      }
      this.#startTime = Date.now()
      if (question.limit) {
        this.#timerLimit.style.display = 'block'
        this.#timer.style.display = 'none'
      } else if (question) {
        this.#timer.style.display = 'block'
      }

      // Clear the timer interval if it's already running
      if (this.#timerInterval) {
        clearInterval(this.#timerInterval)
      }

      // Set the initial value for seconds
      const initialSeconds = question.limit || 20

      this.handleCountdownUpdate(initialSeconds)

      this.#timerInterval = setInterval(() => {
        const now = Date.now()
        const elapsedSeconds = Math.floor((now - this.#startTime) / 1000)

        let remainingSeconds
        if (question.limit !== undefined) {
          remainingSeconds = Math.max(0, question.limit - elapsedSeconds)
        } else if (question !== undefined) {
          remainingSeconds = Math.max(0, 20 - elapsedSeconds)
        }

        // Update the timer
        this.handleCountdownUpdate(remainingSeconds)
        console.log('Remaining seconds:', remainingSeconds)
        localStorage.setItem('remainingSeconds', remainingSeconds)

        // Dispatch a custom event with the timer value
        this.dispatchEvent(new CustomEvent('timerTick', { detail: { timer: remainingSeconds } }))
      }, 1000)
    }

    /**
     * Store the remaining seconds in local storage.
     */
    storeElapsedSeconds () {
      const elapsedSeconds = parseInt(localStorage.getItem('elapsed-seconds'))
      if (elapsedSeconds > 0) {
        this.elapsedSecondsArray.push(elapsedSeconds)
        localStorage.setItem('elapsedSecondsPerQuestion', JSON.stringify(this.elapsedSecondsArray))
      }
    }

    /**
     * Get the remaining seconds.
     *
     * @returns {number} The remaining seconds.
     */
    getRemainingSeconds () {
      const remainingSeconds = localStorage.getItem('remainingSeconds')
      return remainingSeconds
    }

    /**
     * Get the elapsed seconds.
     *
     * @returns {number} The elapsed seconds.
     */
    getElapsedSeconds () {
      const now = Date.now()
      return Math.floor((now - this.#startTime) / 1000)
    }

    /**
     * Clear the timer with a limit.
     */
    clearTimerLimit () {
      this.#timerLimit.textContent = ''
      if (this.#timerLimit) {
        while (this.#timerLimit.firstChild) {
          this.#timerLimit.removeChild(this.#timerLimit.firstChild)
        }
      }
    }

    /**
     * Clear the timer.
     */
    clearTimer () {
      this.#timer.textContent = ''
      if (this.#timer) {
        while (this.#timer.firstChild) {
          this.#timer.removeChild(this.#timer.firstChild)
        }
      }
    }

    /**
     * Handles the countdown update.
     *
     * @param {number} remainingSeconds - The remaining seconds.
     * @returns {*} The remaining seconds.
     */
    handleCountdownUpdate (remainingSeconds) {
      this.#timerSeconds.textContent = remainingSeconds
      this.#limitSeconds.textContent = remainingSeconds
      if (remainingSeconds === 0) {
        this.onTimerEnded()
      } else {
      // Store the remaing seconds in local storage.
        localStorage.setItem('remaining-seconds', remainingSeconds)
        return remainingSeconds
      }
    }

    /**
     * Called when the timer ends.
     */
    onTimerEnded () {
      console.log('Timer ended!')
      clearInterval(this.#timerInterval)
      this.#timerInterval = null

      // Dispatch an event
      this.dispatchEvent(new CustomEvent('timerEnded', { detail: { timerEnded: true } }))
    }

    /**
     * Stops the timer.
     */
    async onStopTimer () {
      clearInterval(this.#timerInterval)
      this.#timerInterval = null

      this.dispatchEvent(new CustomEvent('timerStopped', { detail: { timerStopped: true } }))
      console.log('Timer stopped at:', this.#timerSeconds.textContent)
    }
  })
