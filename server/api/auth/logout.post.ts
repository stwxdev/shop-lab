export default defineEventHandler(async (event) => {
  removeUserSession(event)
  
  return { success: true }
})
