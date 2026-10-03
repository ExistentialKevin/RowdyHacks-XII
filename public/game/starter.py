# Move the player to the green exit using Python!
#
# Available functions:
#   move("up" | "down" | "left" | "right") -> True if the move succeeded
#   can_move(direction)                    -> True if that direction is open
#   at_exit()                              -> True once you're on the exit
#
# Example: keep moving right, then down, until you reach the exit.
while not at_exit():
    if can_move("right"):
        move("right")
    elif can_move("down"):
        move("down")
    else:
        move("up")
