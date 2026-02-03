// Mock for d3-delaunay to avoid ESM import issues in Jest
export class Delaunay {
  triangles: number[] = [];
  
  static from(points: [number, number][]): Delaunay {
    const delaunay = new Delaunay();
    // Simple mock triangulation - just create a basic triangle pattern
    if (points.length >= 3) {
      delaunay.triangles = [0, 1, 2];
    }
    return delaunay;
  }
}

// Made with Bob
