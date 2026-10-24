import { validateInput } from '../utils/validation';

describe('validateInput', () => {
  it('should return an error for an empty string', () => {
    const input = '';
    const result = validateInput(input);
    expect(result).toEqual({ error: 'Input cannot be empty' });
  });

  it('should return an error for a string longer than 100 characters', () => {
    const input = 'a'.repeat(101);
    const result = validateInput(input);
    expect(result).toEqual({ error: 'Input cannot exceed 100 characters' });
  });

  it('should return null for a valid string', () => {
    const input = 'Valid input';
    const result = validateInput(input);
    expect(result).toBeNull();
  });
});

import { createAgent } from '../services/agentService';
import { validateInput } from '../utils/validation';

jest.mock('../utils/validation', () => ({
  validateInput: jest.fn()
}));

describe('createAgent', () => {
  it('should create an agent with valid input', async () => {
    const input = 'Valid input';
    validateInput.mockReturnValue(null);

    const result = await createAgent(input);
    expect(result).toEqual({ success: true, agent: input });
  });

  it('should return an error for invalid input', async () => {
    const input = '';
    validateInput.mockReturnValue({ error: 'Input cannot be empty' });

    const result = await createAgent(input);
    expect(result).toEqual({ success: false, error: 'Input cannot be empty' });
  });
});

import { getAgentById } from '../services/agentService';

describe('getAgentById', () => {
  it('should return an agent by ID', async () => {
    const agentId = '123';
    const agent = { id: agentId, name: 'Agent 123' };

    const result = await getAgentById(agentId);
    expect(result).toEqual(agent);
  });

  it('should throw an error if the agent is not found', async () => {
    const agentId = '404';

    await expect(getAgentById(agentId)).rejects.toThrow('Agent not found');
  });
});

import { updateAgent } from '../services/agentService';
import { validateInput } from '../utils/validation';

jest.mock('../utils/validation', () => ({
  validateInput: jest.fn()
}));

describe('updateAgent', () => {
  it('should update an agent with valid input', async () => {
    const agentId = '123';
    const input = 'Valid input';
    validateInput.mockReturnValue(null);

    const result = await updateAgent(agentId, input);
    expect(result).toEqual({ success: true, agent: { id: agentId, name: input } });
  });

  it('should return an error for invalid input', async () => {
    const agentId = '123';
    const input = '';
    validateInput.mockReturnValue({ error: 'Input cannot be empty' });

    const result = await updateAgent(agentId, input);
    expect(result).toEqual({ success: false, error: 'Input cannot be empty' });
  });
});

import { deleteAgent } from '../services/agentService';

describe('deleteAgent', () => {
  it('should delete an agent by ID', async () => {
    const agentId = '123';

    const result = await deleteAgent(agentId);
    expect(result).toEqual({ success: true });
  });

  it('should throw an error if the agent is not found', async () => {
    const agentId = '404';

    await expect(deleteAgent(agentId)).rejects.toThrow('Agent not found');
  });
});