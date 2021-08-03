type EntryFunction = (setLeave: (leave: () => void) => void) => void
type LeaveFunction = () => void

export default class ProcessManagementContainer {
  private readonly flows = new Map<string, EntryFunction>()
  public current = ''
  public leave: LeaveFunction | undefined

  public addEntry (name: string, flow: EntryFunction): void {
    this.flows.set(name, flow)
  }

  public enter (name: string): void {
    const go = this.flows.get(name)
    if (go === undefined) throw new Error('Cannot find entry ' + name)
    if (this.leave !== undefined) this.leave()
    go(x => { this.leave = x })
    this.current = name
  }
}
