let highestZ = 1;

class Paper {
  holdingPaper = false;
  touchStartX = 0;
  touchStartY = 0;
  touchMoveX = 0;
  touchMoveY = 0;
  prevTouchX = 0;
  prevTouchY = 0;
  rotation = 0; // Initial rotation is 0 degrees
  currentPaperX = 0;
  currentPaperY = 0;
  rotating = false;
  prevTouchDist = 0;

  // Initialize touch events for paper movement
  init(paper) {
    // Touchstart event: When touch is initiated
    paper.addEventListener('touchstart', (e) => {
      if (this.holdingPaper) return; // Ignore if paper is already being held
      this.holdingPaper = true;

      // Bring the paper to the front
      paper.style.zIndex = highestZ;
      highestZ += 1;

      // Store initial touch coordinates
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
      this.prevTouchX = this.touchStartX;
      this.prevTouchY = this.touchStartY;

      // Reset rotation tracking on touch start
      this.prevTouchDist = 0;
    });

    // Touchmove event: When the user moves their finger
    paper.addEventListener('touchmove', (e) => {
      e.preventDefault(); // Prevent default behavior (e.g., scrolling)

      // If paper is being held (single finger movement)
      if (this.holdingPaper && !this.rotating) {
        // Update touch position with current finger position
        this.touchMoveX = e.touches[0].clientX;
        this.touchMoveY = e.touches[0].clientY;

        // Calculate the movement difference (velocity)
        const deltaX = this.touchMoveX - this.prevTouchX;
        const deltaY = this.touchMoveY - this.prevTouchY;

        // Update the paper's position
        this.currentPaperX += deltaX;
        this.currentPaperY += deltaY;

        // Boundary constraints: Ensure paper stays within the screen
        const maxX = window.innerWidth - paper.offsetWidth;
        const maxY = window.innerHeight - paper.offsetHeight;
        this.currentPaperX = Math.min(Math.max(0, this.currentPaperX), maxX);
        this.currentPaperY = Math.min(Math.max(0, this.currentPaperY), maxY);

        // Apply the transformation (translation for position and rotation for rotation)
        paper.style.transform = `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${this.rotation}deg)`;

        // Update previous touch position for next movement
        this.prevTouchX = this.touchMoveX;
        this.prevTouchY = this.touchMoveY;
      }

      // Handle rotation if two fingers are touching (pinch to rotate)
      if (e.touches.length > 1) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];

        const touchDist = Math.sqrt(
          (touch2.clientX - touch1.clientX) ** 2 + (touch2.clientY - touch1.clientY) ** 2
        );

        // If there was a previous distance, calculate rotation based on the change in distance
        if (this.prevTouchDist > 0) {
          const deltaDist = touchDist - this.prevTouchDist;
          this.rotation += deltaDist * 0.1; // Adjust the speed of rotation here
        }

        // Update previous touch distance for next rotation calculation
        this.prevTouchDist = touchDist;

        // Apply rotation along with movement
        paper.style.transform = `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${this.rotation}deg)`;
      }
    });

    // Touchend event: When touch ends
    paper.addEventListener('touchend', () => {
      this.holdingPaper = false; // Reset holding flag
      this.rotating = false; // Reset rotating flag
      this.prevTouchDist = 0; // Reset rotation distance
    });

    // Prevent pinch zoom and other gestures from affecting the paper
    paper.addEventListener('gesturestart', (e) => {
      e.preventDefault();
    });
    paper.addEventListener('gestureend', (e) => {
      e.preventDefault();
    });
  }
}

// Select all elements with the class 'paper' and initialize them
const papers = Array.from(document.querySelectorAll('.paper'));

papers.forEach(paper => {
  const p = new Paper();
  p.init(paper);
});
