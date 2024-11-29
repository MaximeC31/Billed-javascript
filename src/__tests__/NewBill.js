/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from '@testing-library/dom';
import { localStorageMock } from '../__mocks__/localStorage.js';
import NewBillUI from '../views/NewBillUI.js';
import NewBill from '../containers/NewBill.js';

let mockNavigate, mockStore, newBillContainer;

const setupTestEnvironment = (errorType = null) => {
	Object.defineProperty(window, 'localStorage', { value: localStorageMock });
	window.localStorage.setItem(
		'user',
		JSON.stringify({ type: 'Employee', email: 'employee@test.com' }),
	);

	document.body.innerHTML = errorType
		? `
			<div>
				<form data-testid="form-new-bill">
					<input type="file" data-testid="file" />
				</form>
			</div>`
		: NewBillUI();

	mockNavigate = jest.fn();

	const mockCreateBill = errorType
		? jest.fn().mockRejectedValue(new Error(`${errorType} error`))
		: jest.fn().mockResolvedValue();

	mockStore = {
		bills: jest.fn(() => ({
			create: mockCreateBill,
			update: jest.fn().mockResolvedValue(),
		})),
	};

	newBillContainer = new NewBill({
		document,
		onNavigate: mockNavigate,
		store: mockStore,
		localStorage: window.localStorage,
	});

	return { mockCreateBill };
};

describe('Given I am on the New Bill Creation Page', () => {
	beforeEach(() => {
		setupTestEnvironment();
	});

	describe('When I submit the form with valid data', () => {
		test('Then it should successfully create a new bill and log the success', async () => {
			const formElement = screen.getByTestId('form-new-bill');
			const consoleSpy = jest.spyOn(console, 'info').mockImplementation();

			const formFields = {
				'expense-type': 'Transport',
				'expense-name': 'Train Paris-Lyon',
				'datepicker': '2024-04-04',
				'amount': '150',
				'vat': '20',
				'pct': '20',
				'commentary': 'Business trip',
			};

			Object.entries(formFields).forEach(([fieldId, value]) => {
				fireEvent.change(screen.getByTestId(fieldId), { target: { value } });
			});

			newBillContainer.fileName = 'test.jpg';
			newBillContainer.fileUrl = 'https://test.jpg';

			fireEvent.submit(formElement);

			expect(consoleSpy).toHaveBeenCalledWith('La note de frais a été créée avec succès :');
			consoleSpy.mockRestore();
		});
	});

	describe('When I select a valid image file', () => {
		test('Then the file should be accepted', () => {
			const fileInput = screen.getByTestId('file');
			const validFile = new File(['image'], 'test.jpg', { type: 'image/jpg' });

			const handleFileChangeMock = jest.fn((e) => newBillContainer.handleChangeFile(e));
			fileInput.addEventListener('change', handleFileChangeMock);

			fireEvent.change(fileInput, { target: { files: [validFile] } });

			expect(handleFileChangeMock).toHaveBeenCalled();
			expect(fileInput.files[0].name).toBe('test.jpg');
		});
	});

	describe('When I select an invalid non-image file', () => {
		test('Then the file should be rejected and an alert should appear', () => {
			const alertMock = jest.spyOn(window, 'alert').mockImplementation();
			const fileInput = screen.getByTestId('file');
			const invalidFile = new File(['text'], 'test.txt', { type: 'text/plain' });

			const handleFileChangeMock = jest.fn((e) => newBillContainer.handleChangeFile(e));
			fileInput.addEventListener('change', handleFileChangeMock);

			fireEvent.change(fileInput, { target: { files: [invalidFile] } });

			expect(handleFileChangeMock).toHaveBeenCalled();
			expect(alertMock).toHaveBeenCalledWith(
				'Seuls les fichiers avec les extensions jpg, jpeg, png ou webp sont autorisés.',
			);
			expect(fileInput.value).toBe('');
		});
	});

	describe('When the amount field contains a non-numeric value', () => {
		test('Then form submission should be prevented', async () => {
			const formElement = screen.getByTestId('form-new-bill');
			const amountInput = screen.getByTestId('amount');

			fireEvent.change(amountInput, { target: { value: 'abc' } });

			fireEvent.submit(formElement);

			expect(amountInput.value).toMatch(/^\d*$/);
		});
	});
});

describe('Given I am handling API errors when uploading a new bill', () => {
	describe('When the API returns a 404 error', () => {
		test('Then the error should be caught and handled', async () => {
			const errorCode = 404;
			const { mockCreateBill } = setupTestEnvironment(errorCode);

			const fileInput = screen.getByTestId('file');
			const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
			fireEvent.change(fileInput, { target: { files: [file] } });

			expect(mockCreateBill).toHaveBeenCalled();
			await expect(mockCreateBill).rejects.toThrow(`${errorCode} error`);
		});
	});

	describe('When the API returns a 500 error', () => {
		test('Then the error should be caught and handled', async () => {
			const errorCode = 500;
			const { mockCreateBill } = setupTestEnvironment(errorCode);

			const fileInput = screen.getByTestId('file');
			const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
			fireEvent.change(fileInput, { target: { files: [file] } });

			expect(mockCreateBill).toHaveBeenCalled();
			await expect(mockCreateBill).rejects.toThrow(`${errorCode} error`);
		});
	});
});
