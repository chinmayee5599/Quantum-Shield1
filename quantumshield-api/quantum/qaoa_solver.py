import time
from qiskit_optimization.translators import from_docplex_mp
from qiskit_optimization.converters import QuadraticProgramToQubo
from qiskit.primitives import StatevectorSampler as Sampler
from qiskit_algorithms import QAOA
from qiskit_algorithms.optimizers import COBYLA
from qiskit_optimization.algorithms import MinimumEigenOptimizer

def solve_qaoa(mdl):
    """
    Solves the docplex QUBO model using QAOA on a local simulator.
    """
    # 1. Convert docplex model to Qiskit QuadraticProgram
    qp = from_docplex_mp(mdl)
    
    # 2. Convert to strictly QUBO form
    conv = QuadraticProgramToQubo()
    qubo = conv.convert(qp)
    
    # 3. Translate to Ising Hamiltonian to count qubits
    op, offset = qubo.to_ising()
    num_qubits = op.num_qubits
    
    # 4. Setup QAOA with a classical optimizer (COBYLA)
    sampler = Sampler()
    optimizer = COBYLA(maxiter=100)
    reps = 2
    qaoa = QAOA(sampler=sampler, optimizer=optimizer, reps=reps)
    
    eigen_optimizer = MinimumEigenOptimizer(qaoa)
    
    # 5. Execute Optimization
    start_time = time.time()
    result = eigen_optimizer.solve(qubo)
    end_time = time.time()
    
    execution_time = end_time - start_time
    
    # 6. Extract Solution
    selected_controls = []
    for var, val in zip(qubo.variables, result.x):
        if val == 1.0:
            selected_controls.append(var.name.replace("x_", ""))
            
    return {
        "num_variables": qubo.get_num_vars(),
        "num_qubits": num_qubits,
        "qaoa_depth": reps,
        "best_objective_value": result.fval,
        "execution_time_sec": execution_time,
        "selected_controls": selected_controls,
        "status": str(result.status)
    }
