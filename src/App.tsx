import React, { useState, useEffect, useRef } from 'react'
import { auth } from './main'
import { signInWithEmailAndPassword, onAuthStateChanged, User, signOut } from 'firebase/auth'
import { Upload, FileSpreadsheet } from 'lucide-react'
import * as XLSX from 'xlsx'

const REPO_OWNER = 'davisricart';
const REPO_NAME = 'grbalance-auth';
const SCRIPT_PATH = 'scripts';

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user) {
    return <LoginPage />
  }

  return <MainPage user={user} />
}

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      setError('Invalid email or password')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img 
            src="/gr-logo.png" 
            alt="Beauty and Grace Logo" 
            className="h-20 w-auto" 
          />
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-6">Beauty and Grace</h1>
        <p className="text-center text-gray-600 mb-8">Payment Reconciliation Service</p>
        
        <form onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function MainPage({ user }: { user: User }) {
  const [file1, setFile1] = useState<File | null>(null)
  const [file2, setFile2] = useState<File | null>(null)
  const [script, setScript] = useState('')
  const [status, setStatus] = useState('')
  const [results, setResults] = useState<any[]>([])
  const file1Ref = useRef<HTMLInputElement>(null)
  const file2Ref = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, setFile: (file: File | null) => void) => {
    const files = event.target.files
    if (files && files[0]) {
      setFile(files[0])
    }
  }

  const handleDrop = (event: React.DragEvent, setFile: (file: File | null) => void) => {
    event.preventDefault()
    const files = event.dataTransfer.files
    if (files && files[0]) {
      setFile(files[0])
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const executeComparison = async (script: string, file1Content: ArrayBuffer, file2Content: ArrayBuffer) => {
    const CompareFunction = new Function('XLSX', 'file1', 'file2', 
      `return (async () => {
        ${script}
        return compareAndDisplayData(XLSX, file1, file2);
      })();`
    )
    return await CompareFunction(XLSX, file1Content, file2Content)
  }

  const handleCompare = async () => {
    if (!file1 || !file2 || !script) {
      setStatus('Please select both files and a script')
      return
    }

    try {
      setStatus('Processing files...')
      
      const content1 = await readExcelFile(file1)
      const content2 = await readExcelFile(file2)

      setStatus('Fetching script...')
      let scriptContent = await fetchComparisonScript(script)
      
      setStatus('Comparing files...')
      const result = await executeComparison(scriptContent, content1, content2)
      
      setResults(result)
      setStatus('Comparison complete!')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'An error occurred')
    }
  }

  const readExcelFile = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as ArrayBuffer)
      reader.onerror = (e) => reject(new Error('Failed to read file'))
      reader.readAsArrayBuffer(file)
    })
  }

  const fetchComparisonScript = async (scriptName: string) => {
    const response = await fetch(`https://api.github.com/repos/davisricart/grbalance-auth/contents/scripts/${scriptName}.js`)
    if (!response.ok) throw new Error('Failed to fetch comparison script')
    const data = await response.json()
    return atob(data.content)
  }

  const downloadResults = () => {
    if (results.length === 0) return
    
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.aoa_to_sheet(results)
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Results')
    XLSX.writeFile(workbook, 'Comparison_Results.xlsx')
  }

  const handleClear = () => {
    setFile1(null)
    setFile2(null)
    setScript('')
    setStatus('')
    setResults([])
    if (file1Ref.current) file1Ref.current.value = ''
    if (file2Ref.current) file2Ref.current.value = ''
  }

  const handleLogout = () => {
    signOut(auth)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Beauty and Grace</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{user.email}</span>
            <button
              onClick={handleLogout}
              className="bg-white text-gray-700 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Upload First File</label>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"
                onDrop={(e) => handleDrop(e, setFile1)}
                onDragOver={handleDragOver}
              >
                <input
                  type="file"
                  ref={file1Ref}
                  onChange={(e) => handleFileUpload(e, setFile1)}
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                />
                <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  {file1 ? file1.name : "Drag & drop your first Excel or CSV file here"}
                </p>
                <button 
                  onClick={() => file1Ref.current?.click()}
                  className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Select File
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Upload Second File</label>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"
                onDrop={(e) => handleDrop(e, setFile2)}
                onDragOver={handleDragOver}
              >
                <input
                  type="file"
                  ref={file2Ref}
                  onChange={(e) => handleFileUpload(e, setFile2)}
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                />
                <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  {file2 ? file2.name : "Drag & drop your second Excel or CSV file here"}
                </p>
                <button 
                  onClick={() => file2Ref.current?.click()}
                  className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Select File
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700">Select Script</label>
            <select 
              value={script}
              onChange={(e) => setScript(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select a script...</option>
              <option value="run5">Main HUB vs Sales</option>
            </select>
          </div>

          {status && (
            <div className="mt-4 text-sm text-gray-600">{status}</div>
          )}

          <div className="mt-6 flex gap-4">
            <button 
              onClick={handleCompare}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Run Comparison
            </button>
            <button 
              onClick={handleClear}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Clear Form
            </button>
          </div>

          {results.length > 0 && (
            <div className="mt-8 bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Results</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {results[0]?.map((header: string, i: number) => (
                        <th
                          key={i}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {results.slice(1).map((row, i) => (
                      <tr key={i}>
                        {row.map((cell: any, j: number) => {
                          const isNumber = typeof cell === 'number'
                          const isNegative = isNumber && cell < 0
                          
                          return (
                            <td
                              key={j}
                              className={`px-6 py-4 whitespace-nowrap ${
                                isNumber
                                  ? isNegative
                                    ? 'bg-red-50 text-red-600 font-medium'
                                    : 'bg-green-50 text-green-600 font-medium'
                                  : 'text-gray-900'
                              }`}
                            >
                              {cell}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={downloadResults}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  Download Results
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
