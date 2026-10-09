import time
from qiskit_optimization import QuadraticProgram
from qiskit_optimization.algorithms import MinimumEigenOptimizer
from qiskit_algorithms import QAOA
from qiskit_algorithms.optimizers import COBYLA

def minimal_test():
    print("--- Starting Minimal QAOA Smoke Test ---")
    
    # 1. Create a minimal QuadraticProgram (3 qubits)
    qp = QuadraticProgram()
    qp.binary_var('x1')
    qp.binary_var('x2')
    qp.binary_var('x3')
    
    # Objective: Minimize x1 + x2 - 2*x3 + x1*x2 - x2*x3
    qp.minimize(linear={'x1': 1, 'x2': 1, 'x3': -2},
                quadratic={('x1', 'x2'): 1, ('x2', 'x3'): -1})
                
    print("Quadratic Program Created (3 Variables).")
    
    # 2. Setup QAOA
    print("Setting up QAOA with COBYLA and 1 Rep...")
    try:
        from qiskit.primitives import StatevectorSampler
        sampler = StatevectorSampler()
        print("Successfully loaded StatevectorSampler.")
    except ImportError as e:
        print(f"Failed to load sampler: {e}")
        return

    optimizer = COBYLA(maxiter=50)
    qaoa = QAOA(sampler=sampler, optimizer=optimizer, reps=1)
    
    eigen_optimizer = MinimumEigenOptimizer(qaoa)
    
    # 3. Solve
    print("Solving... (Should take less than 10 seconds for 3 qubits)")
    start_time = time.time()
    try:
        result = eigen_optimizer.solve(qp)
        end_time = time.time()
        
        print("\n--- Smoke Test Results ---")
        print(f"Status: {result.status}")
        print(f"Optimal Variables: {result.x}")
        print(f"Optimal Value: {result.fval}")
        print(f"Execution Time: {end_time - start_time:.3f} seconds")
    except Exception as e:
        print(f"Error during execution: {e}")

if __name__ == "__main__":
    minimal_test()
