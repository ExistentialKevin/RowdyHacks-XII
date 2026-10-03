import pygame
# Initialize Pygame
pygame.init()
# Set up the display
screen = pygame.display.set_mode((800, 600))
# Main game loop
running = True
while running:
   for event in pygame.event.get():
       if event.type == pygame.QUIT:
           running = False
   # Fill the screen with a color
   screen.fill((0, 0, 255))
   # Update the display
   pygame.display.flip()
# Quit Pygame
pygame.quit()