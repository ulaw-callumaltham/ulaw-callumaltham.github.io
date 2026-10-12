"""
Lesson 12: Putting It Together - Number Guessing Game
=====================================================
Combine variables, input, loops, if statements and functions.
"""

import random


def play_game():
    secret = random.randint(1, 100)
    attempts = 0
    guess = 0

    print("I'm thinking of a number between 1 and 100.")

    # TODO: Use a while loop that repeats until guess equals secret
    #   - Ask for a guess and convert it to an integer
    #   - Add 1 to attempts
    #   - Print "Too high!" or "Too low!" as appropriate

    # TODO: Print a message saying how many attempts it took


play_game()
