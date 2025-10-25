import numpy as np


class Grid:

    def __init__(self, width, height):
        self.width = width
        self.height = height
        self.grid = np.zeros([width, height])

    def randomise(self):
        
        for x in range(self.width):
            for y in range(self.height):
                self.grid[x,y] = 1 if (np.random.uniform()>.5) else 0

    def as_list(self):
        return self.grid.tolist()